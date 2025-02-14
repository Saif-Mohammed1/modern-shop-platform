import AppError from "@/app/lib/utilities/appError";
import { userControllerTranslate } from "@/public/locales/server/userControllerTranslate";
import { lang } from "@/app/lib/utilities/lang";
import { generateVerificationToken } from "@/app/lib/utilities/user.utilty";
import { DeviceInfo } from "@/app/lib/types/refresh.types";
import { UserRepository } from "../repositories/user.repository";
import { emailService } from "@/app/lib/services/email.service";
import {
  UserChangePasswordDTO,
  UserCreateDTO,
  UserValidation,
} from "../dtos/user.dto";
import { cookies } from "next/headers";
import { authControllerTranslate } from "@/public/locales/server/authControllerTranslate";
import { AuditAction } from "@/app/lib/types/audit.types";
import UserModel, { IUser, UserRole, UserStatus } from "../models/User.model";
import { SessionService } from "./session.service";
import { TokensService } from "./tokens.service";
import { VoidFunctionComponent } from "react";

export class UserService {
  constructor(
    private repository: UserRepository = new UserRepository(UserModel),
    private sessionService: SessionService = new SessionService(),
    private tokensService: TokensService = new TokensService()
  ) {}

  // UserModel Registration
  async registerUser(
    dto: UserCreateDTO,
    deviceInfo: DeviceInfo
  ): Promise<IUser> {
    const session = await this.repository.startSession();
    try {
      session.startTransaction();
      dto.email = UserValidation.sanitizeEmail(dto.email);
      const existingUser = await this.repository.findByEmail(dto.email);
      if (existingUser) {
        throw new AppError(
          userControllerTranslate[lang].errors.userAlreadyExist,
          400
        );
      }
      const user = await this.repository.createUser(dto, session);
      // Generate and send verification token
      const verificationToken = generateVerificationToken();

      await Promise.all([
        this.repository.setVerificationToken(
          user._id,
          verificationToken,
          session
        ),

        emailService.sendVerification(user.email, verificationToken),

        // Audit log
        this.repository.createAuditLog(
          user._id,
          AuditAction.REGISTRATION,
          {
            device: deviceInfo,
          },
          session
        ),
      ]);
      await session.commitTransaction();
      return user;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }

  // UserModel Authentication
  async authenticateUser(
    email: string,
    password: string,

    deviceInfo: DeviceInfo
  ): Promise<
    | { user: IUser; accessToken: string; refreshToken: string }
    | {
        requires2FA: boolean;
        tempToken: string;
        expires: Date;
        message: string;
      }
  > {
    email = UserValidation.sanitizeEmail(email);
    const user = await this.repository.findByEmail(email);
    if (!user || !user.password) {
      throw new AppError("Invalid credentials", 401);
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new AppError("Account suspended", 403);
    }
    user.checkRateLimit("login");
    // if (user.isAccountLocked("login")) {
    //   throw new AppError("Account temporarily locked", 423);
    // }

    const isValid = await user.comparePassword(password);
    await this.repository.trackLogin(user, deviceInfo, isValid);

    if (!isValid) {
      // if (user.security.loginAttempts >= 5) {
      //   await EmailService.security.sendLockoutAlert(user);
      // }
      await this.repository.incrementRateLimit(user, "login");
      // await user.incrementRateLimit("login");
      // await user.save();
      throw new AppError("Invalid credentials", 401);
    }

    if (user.security.twoFactorEnabled) {
      const tempToken = await this.repository.generateMFAToken(user._id);
      const expires = new Date(Date.now() + 1000 * 60 * 5);
      cookies().set("tempToken", tempToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
        expires,
        path: "/auth",
      });
      return {
        requires2FA: true,
        tempToken: tempToken,
        expires,
        message:
          authControllerTranslate[lang].functions.logIn.twoFactorRequired,
      };
    }
    const { accessToken, refreshToken, hashedToken } =
      this.tokensService.generateAuthTokens(user._id);
    // Create new session
    await Promise.all([
      this.sessionService.createSession(
        user._id,
        deviceInfo,
        hashedToken,
        this.tokensService.getRefreshTokenExpiry()
      ),
      this.repository.updateLastLogin(user._id),
    ]);

    cookies().set(this.tokensService.COOKIE_NAME, refreshToken, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax", // 'Lax' in development if set none need secure to true
      secure: process.env.NODE_ENV === "production", // 'false' in development
      path: "/",
      expires: this.tokensService.getRefreshTokenExpiry(),
      // Add these for enhanced security:
      partitioned: true, // Chrome 109+ feature
      priority: "high", // Protect against CRIME attacks
    });
    // Update last login

    await this.repository.clearRateLimit(user, "login");
    return { user, accessToken, refreshToken };
  }
  // async authenticateUserWithMFA(
  //   userId: string,
  //   token: string
  // ): Promise<{ accessToken: string; refreshToken: string }> {
  //   const user = await this.repository.findById(userId);
  //   if (!user) {
  //     throw new AppError("User not found", 404);
  //   }

  //   const isValid = await this.repository.verifyMFAToken(userId, token);
  //   if (!isValid) {
  //     throw new AppError("Invalid MFA token", 401);
  //   }

  //   const { accessToken, refreshToken, hashedToken } =
  //     this.tokensService.generateAuthTokens(user._id);
  //   // Create new session
  //   await this.sessionService.createSession(
  //     user._id,
  //     { ipAddress: "

  //     " },
  //     hashedToken,
  //     this.tokensService.getRefreshTokenExpiry()
  //   );
  //   cookies().set(this.tokensService.COOKIE_NAME, refreshToken, {
  //     httpOnly: true,
  //     sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax", // 'Lax' in development if set none need secure to true
  //     secure: process.env.NODE_ENV === "production", // 'false' in development

  //   });
  //   // Update last login
  //   await this.repository.updateLastLogin(user._id);

  //   return { accessToken, refreshToken };
  // }

  // Password Management
  async findUserById(userId: string): Promise<IUser | null> {
    return this.repository.findById(userId);
  }
  async logOut(): Promise<{
    message: string;
  }> {
    cookies().set(this.tokensService.COOKIE_NAME, "", {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      secure: process.env.NODE_ENV === "production",
      expires: new Date(0),
      path: "/",
      priority: "high",
      partitioned: true,
    });

    return { message: "Logged out" };
  }
  async requestPasswordReset(
    email: string,
    deviceInfo: DeviceInfo
  ): Promise<void> {
    email = UserValidation.sanitizeEmail(email);

    const session = await this.repository.startSession();
    try {
      session.startTransaction();
      const user = await this.repository.findByEmail(email);
      if (!user) return; // Don't reveal user existence
      user.checkRateLimit("passwordReset");

      const resetToken = await this.repository.generatePasswordResetToken(
        user._id,
        session
      );

      await Promise.all([
        // await EmailService.passwordReset.sendPasswordReset(user.email, resetToken);
        emailService.sendPasswordReset(user.email, resetToken),
        this.repository.createAuditLog(
          user._id,
          AuditAction.PASSWORD_RESET_REQUEST,
          { device: deviceInfo },
          session
        ),

        this.repository.incrementRateLimit(user, "passwordReset", session),
      ]);
      await session.commitTransaction();
    } catch (error) {
      session.abortTransaction();

      throw error;
    } finally {
      session.endSession();
    }
  }

  async validateEmailAndToken(token: string, email: string): Promise<boolean> {
    const user = await this.repository.validateResetPasswordEmailAndToken(
      token,
      email
    );
    if (!user) {
      throw new AppError("Invalid or expired token", 400);
    }
    return true;
  }

  async validatePasswordResetToken(
    token: string,
    newPassword: string,
    deviceInfo: DeviceInfo
  ): Promise<void> {
    const session = await this.repository.startSession();

    const user =
      await this.repository.validateResetPasswordEmailAndToken(token);
    if (!user) {
      throw new AppError("Invalid or expired token", 400);
    }
    try {
      session.startTransaction();
      // 4. Check against previous passwords
      if (await user.isPreviousPassword(newPassword)) {
        throw new AppError("Cannot reuse previous passwords", 400);
      }

      // 5. Update password and invalidate token
      await Promise.all([
        this.repository.updatePassword(user, newPassword, session),
        this.repository.invalidateResetToken(user._id, session),
        this.repository.createAuditLog(
          user._id,
          AuditAction.PASSWORD_RESET,
          {
            device: deviceInfo,
          },
          session
        ),
      ]);
      // 6. Send security notification
      await emailService.sendPasswordChangeConfirmation(user.email);
      session.commitTransaction();
    } catch (error) {
      session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
  // async confirmPasswordReset(
  //   newPassword: string,
  //   confirmNewPassword: string,
  //   ): Promise<void> {
  //   if (newPassword !== confirmNewPassword) {
  //     throw new AppError("Passwords do not match", 400);
  //   }
  //     await this.repository.updatePassword(userId, newPassword);
  //   }

  async changePassword(
    userId: string,
    dto: UserChangePasswordDTO
  ): Promise<void> {
    const user = await this.repository.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    if (!(await user.comparePassword(dto.currentPassword))) {
      throw new AppError("Current password is incorrect", 401);
    }
    if (await user.isPreviousPassword(dto.newPassword)) {
      throw new AppError("Cannot reuse previous passwords", 400);
    }
    await this.repository.updatePassword(user, dto.newPassword);
  }

  // Email Verification
  async sendVerificationEmail(userId: string): Promise<void> {
    const user = await this.repository.findById(userId);
    if (!user) {
      throw new AppError("User not found ", 404);
    }
    if (user?.verification.emailVerified) {
      throw new AppError("Email already verified", 400);
    }

    const verificationToken = generateVerificationToken();
    await Promise.all([
      this.repository.setVerificationToken(userId, verificationToken),

      emailService.sendVerification(user.email, verificationToken),
    ]);
  }

  async verifyEmail(token: string): Promise<IUser | null> {
    return this.repository.verifyUserEmail(token);
  }

  // Account Management
  // async updateProfile(userId: string, dto: UserUpdateDTO): Promise<IUser> {
  //   return this.repository.updateUser(userId, dto);
  // }

  async requestEmailChange(userId: string, newEmail: string): Promise<void> {
    const existingUser = await this.repository.findByEmail(newEmail);
    if (existingUser) {
      throw new AppError("Email already in use", 409);
    }
    const user = await this.repository.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    const changeToken = this.repository.generateEmailChangeToken(
      userId,
      newEmail
    );

    await emailService.sendEmailChangeConfirmation(user.email, changeToken);
  }

  async confirmEmailChange(token: string): Promise<IUser> {
    return this.repository.processEmailChange(token);
  }

  async deactivateAccount(userId: string): Promise<void> {
    this.repository.updateUserStatus(userId, UserStatus.INACTIVE);
  }

  async deleteAccount(userId: string): Promise<void> {
    await Promise.all([
      this.repository.deleteUser(userId),
      this.sessionService.revokeAllSessions(userId),
    ]);
  }

  // Admin Functions
  async getAllUsers(options?: UserQueryOptions): Promise<IUser[]> {
    return this.repository.findAllUsers(options);
  }

  async updateUserRole(userId: string, role: UserRole): Promise<void> {
    this.repository.updateUserRole(userId, role);
  }

  async suspendUser(userId: string): Promise<void> {
    await this.sessionService.revokeAllSessions(userId);
    this.repository.updateUserStatus(userId, UserStatus.SUSPENDED);
  }

  // Security Functions
  async getActiveSessions(userId: string): Promise<Session[]> {
    return this.sessionService.getUserSessions(userId);
  }

  async revokeSession(userId: string): Promise<void> {
    await this.sessionService.revokeSession(userId);
  }

  async enableMFA(userId: string): Promise<{ secret: string; qrCode: string }> {
    return this.repository.enableMultiFactorAuth(userId);
  }

  async verifyMFA(
    userId: string,
    token: string
  ): Promise<{ recoveryCodes: string[] }> {
    return this.repository.verifyMfaSetup(userId, token);
  }
}
