import AppError from "@/app/lib/utilities/appError";
import { userControllerTranslate } from "@/public/locales/server/userControllerTranslate";
import { lang } from "@/app/lib/utilities/lang";
import { generateVerificationToken } from "@/app/lib/utilities/user.utilty";
import { DeviceInfo } from "@/app/lib/types/session.types";
import { UserRepository } from "../repositories/user.repository";
import { emailService } from "@/app/lib/services/email.service";
import { UserChangePasswordDTO, UserCreateDTO } from "../dtos/user.dto";
import { cookies } from "next/headers";
import { authControllerTranslate } from "@/public/locales/server/authControllerTranslate";
import { AuditAction, AuditLogDetails } from "@/app/lib/types/audit.types";
import UserModel, {
  accountAction,
  IUser,
  UserRole,
  UserStatus,
} from "../models/User.model";
import { SessionService } from "./session.service";
import { TokensService } from "./tokens.service";
import { AuthTranslate } from "@/public/locales/server/Auth.Translate";
import { ISession } from "../models/Session.model";
import {
  QueryBuilderResult,
  QueryOptionConfig,
} from "@/app/lib/types/queryBuilder.types";

export class UserService {
  constructor(
    private repository: UserRepository = new UserRepository(UserModel),
    private sessionService: SessionService = new SessionService(),
    private tokensService: TokensService = new TokensService()
  ) {}
  async finalizeLogin(user: IUser, deviceInfo: DeviceInfo) {
    const { accessToken, refreshToken, hashedToken } =
      this.tokensService.generateAuthTokens(user._id.toString());

    await Promise.all([
      this.sessionService.createSession(
        user._id.toString(),
        deviceInfo,
        hashedToken,
        this.tokensService.getRefreshTokenExpiry()
      ),
      this.repository.updateLastLogin(user._id),
      this.repository.clearTwoFactorSecret(String(user._id)),
    ]);
    this.tokensService.setRefreshTokenCookies(refreshToken);
    await this.repository.clearRateLimit(user, "login");

    return { user, accessToken, refreshToken };
  }
  // UserModel Registration
  async registerUser(
    dto: UserCreateDTO,
    deviceInfo: DeviceInfo
  ): Promise<IUser> {
    const session = await this.repository.startSession();
    try {
      session.startTransaction();
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
          user._id.toString(),
          verificationToken,
          session
        ),

        emailService.sendVerification(user.email, verificationToken),

        // Audit log
        this.repository.createAuditLog(
          user._id.toString(),
          AuditAction.REGISTRATION,
          {
            success: true,
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
    const user = await this.repository.findByEmail(email);
    if (!user || !user.password) {
      throw new AppError(
        AuthTranslate[lang].userService.authenticateUser.invalidCredentials,
        401
      );
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new AppError(
        AuthTranslate[lang].userService.authenticateUser.userSuspended,
        403
      );
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
      throw new AppError(
        AuthTranslate[lang].userService.authenticateUser.invalidCredentials,
        401
      );
    }

    if (user.security.twoFactorEnabled) {
      user.checkRateLimit("2fa");

      const tempToken = await this.repository.generateMFAToken(
        user._id.toString()
      );
      const expires = new Date(Date.now() + 1000 * 60 * 5);
      cookies().set("tempToken", tempToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
        expires,
        path: "/",
      });
      await this.repository.incrementRateLimit(user, "2fa");
      return {
        requires2FA: true,
        tempToken: tempToken,
        expires,
        message:
          authControllerTranslate[lang].functions.logIn.twoFactorRequired,
      };
    }
    // const { accessToken, refreshToken, hashedToken } =
    //   this.tokensService.generateAuthTokens(user._id.toString());
    // // Create new session
    // await Promise.all([
    //   this.sessionService.createSession(
    //     user._id.toString(),
    //     deviceInfo,
    //     hashedToken,
    //     this.tokensService.getRefreshTokenExpiry()
    //   ),
    //   this.repository.updateLastLogin(user._id),
    // ]);
    // this.tokensService.setRefreshTokenCookies(refreshToken);

    // // Update last login

    // await this.repository.clearRateLimit(user, "login");
    // return { user, accessToken, refreshToken };
    return this.finalizeLogin(user, deviceInfo);
  }
  async clearRateLimit(user: IUser, action: accountAction): Promise<void> {
    await this.repository.clearRateLimit(user, action);
  }

  async incrementRateLimit(user: IUser, action: accountAction): Promise<void> {
    await this.repository.incrementRateLimit(user, action);
  }
  // Password Management
  async findUserById(userId: string): Promise<IUser | null> {
    return this.repository.findById(userId);
  }
  async logOut(): Promise<{
    message: string;
  }> {
    this.tokensService.clearRefreshTokenCookies();

    return { message: AuthTranslate[lang].auth.logOut.logOutSuccess };
  }
  async requestPasswordReset(
    email: string,
    deviceInfo: DeviceInfo
  ): Promise<void> {
    const session = await this.repository.startSession();
    try {
      session.startTransaction();
      const user = await this.repository.findByEmail(email);
      if (!user) return; // Don't reveal user existence
      user.checkRateLimit("passwordReset");

      const resetToken = await this.repository.generatePasswordResetToken(
        user._id.toString(),
        session
      );

      await Promise.all([
        // await EmailService.passwordReset.sendPasswordReset(user.email, resetToken);
        emailService.sendPasswordReset(user.email, resetToken),
        this.repository.createAuditLog(
          user._id.toString(),
          AuditAction.PASSWORD_RESET_REQUEST,
          { device: deviceInfo, success: true },
          session
        ),

        this.repository.incrementRateLimit(user, "passwordReset", session),
      ]);
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();

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
      throw new AppError(
        AuthTranslate[lang].userService.validateEmailAndToken.invalidToken,
        400
      );
    }
    return true;
  }
  async findUserByEmail(email: string): Promise<IUser | null> {
    return this.repository.findByEmail(email);
  }
  async validatePasswordResetToken(
    token: string,
    email: string,
    newPassword: string,
    deviceInfo: DeviceInfo
  ): Promise<void> {
    const session = await this.repository.startSession();
    session.startTransaction();

    const user = await this.repository.validateResetPasswordEmailAndToken(
      token,
      email
    );
    if (!user) {
      throw new AppError(
        AuthTranslate[lang].userService.validateEmailAndToken.invalidToken,
        400
      );
    }
    try {
      // 4. Check against previous passwords
      if (await user.isPreviousPassword(newPassword)) {
        throw new AppError(
          AuthTranslate[lang].userService.isPreviousPassword.passwordMatch,
          400
        );
      }

      // 5. Update password and invalidate token
      await this.repository.updatePassword(user, newPassword, session);
      await this.repository.invalidateResetToken(user._id.toString(), session);
      await this.repository.clearRateLimit(user, "passwordReset");

      await this.repository.createAuditLog(
        user._id.toString(),
        AuditAction.PASSWORD_RESET,
        {
          device: deviceInfo,
          success: true,
        },
        session
      ),
        // await Promise.all([
        //   this.repository.updatePassword(user, newPassword, session),
        //   this.repository.invalidateResetToken(user._id.toString(), session),
        //   this.repository.createAuditLog(
        //     user._id.toString(),
        //     AuditAction.PASSWORD_RESET,
        //     {
        //       device: deviceInfo,
        //     },
        //     session
        //   ),
        // ]);
        // 6. Send security notification
        await emailService.sendPasswordChangeConfirmation(user.email);
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
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
  async createAuditLog(
    userId: string,
    action: AuditAction,
    details: AuditLogDetails
  ): Promise<void> {
    return this.repository.createAuditLog(userId, action, details);
  }
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
  async sendVerificationCode(userId: string): Promise<void> {
    const user = await this.repository.findById(userId);
    if (!user) {
      throw new AppError("User not found ", 404);
    }
    if (user?.verification.emailVerified) {
      throw new AppError("Email already verified", 400);
    }

    user.checkRateLimit("verification");
    try {
      await this.regenerateVerificationCode(user);
    } catch (error) {
      await this.repository.createAuditLog(
        user._id.toString(),
        AuditAction.VERIFICATION_EMAIL_FAILURE,
        {
          success: false,
        }
      );
    }
    await this.repository.incrementRateLimit(user, "verification");
  }
  async regenerateVerificationCode(user: IUser): Promise<void> {
    const verificationToken = generateVerificationToken();
    const hashedToken =
      this.tokensService.hashVerificationToken(verificationToken);
    const session = await this.repository.startSession();
    await session.withTransaction(async () => {
      await Promise.all([
        this.repository.setVerificationToken(
          user._id.toString(),
          hashedToken,
          session
        ),
        emailService.sendVerification(user.email, verificationToken),
        this.repository.createAuditLog(
          user._id.toString(),
          AuditAction.VERIFICATION_EMAIL_REQUEST,
          {
            success: true,
          },
          session
        ),
      ]);
    });
  }
  // await Promise.all([
  //   this.repository.setVerificationToken(
  //     user._id.toString(),
  //     verificationToken
  //   ),
  //   this.repository.createAuditLog(
  //     user._id.toString(),
  //     AuditAction.VERIFICATION_EMAIL_REQUEST,
  //     {
  //       success: true,
  //     }
  //   ),
  //   emailService.sendVerification(user.email, verificationToken),
  // ]);

  async verifyEmail(userId: string, token: string): Promise<IUser | null> {
    const user = await this.repository.findById(userId);
    if (!user) {
      throw new AppError("Invalid token", 400);
    }
    user.checkRateLimit("verification");
    if (user.verification.emailVerified) {
      throw new AppError("Email already verified", 400);
    }
    try {
      const hashedToken = this.tokensService.hashVerificationToken(token);
      const isVerify = await this.repository.verifyUserEmail(hashedToken);
      if (!isVerify?.verification.emailVerified) {
        throw new AppError("Invalid token", 400);
      }
      await this.repository.clearRateLimit(user, "verification");
      return isVerify;
    } catch (error) {
      await this.repository.createAuditLog(
        user._id.toString(),
        AuditAction.VERIFICATION_EMAIL_FAILURE,
        {
          success: false,
        }
      );
      await this.repository.incrementRateLimit(user, "verification");
      throw error;
    }
  }
  async disable2FA(userId: string): Promise<void> {
    await this.repository.disable2FA(userId);
  }
  async enable2FA(userId: string): Promise<void> {
    await this.repository.enable2FA(userId);
  }
  async validateTempToken(tempToken: string): Promise<IUser> {
    const user = await this.repository.validateTempToken(tempToken);
    if (!user) {
      throw new AppError("Invalid token", 400);
    }
    return user;
  }
  async generateSessionToken(email: string): Promise<{
    message: string;
    tempToken: string;
    tempTokenExpires: Date;
  }> {
    const user = await this.repository.findByEmail(email);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (
      user.security.twoFactorSecret &&
      user?.security?.twoFactorSecretExpiry &&
      user.security.twoFactorSecretExpiry > new Date(Date.now())
    ) {
      return {
        message: "Temporary token generated",
        tempToken: user.security.twoFactorSecret,
        tempTokenExpires: user.security.twoFactorSecretExpiry,
      };
    }
    user.checkRateLimit("2fa");

    const tempToken = await this.repository.generateMFAToken(
      user._id.toString()
    );
    const expires = new Date(Date.now() + 1000 * 60 * 5);
    cookies().set("tempToken", tempToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      expires,
      path: "/",
    });
    await this.repository.incrementRateLimit(user, "2fa");
    return {
      message: "Temporary token generated",
      tempToken,
      tempTokenExpires: expires,
    };
  }
  // Account Management
  // async updateProfile(userId: string, dto: UserUpdateDTO): Promise<IUser> {
  //   return this.repository.updateUser(userId, dto);
  // }
  async requestEmailChange(
    userId: string,
    newEmail: string,
    deviceInfo: DeviceInfo
  ): Promise<void> {
    const existingUser = await this.repository.findByEmail(newEmail);
    if (existingUser) {
      throw new AppError("Email already in use", 409);
    }
    const user = await this.repository.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    const changeToken = await this.repository.generateEmailChangeToken(
      userId,
      newEmail
    );
    await this.repository.createAuditLog(
      userId,
      AuditAction.EMAIL_CHANGE_REQUEST,
      {
        success: true,
        device: deviceInfo,
        newEmail,
      }
    );
    await emailService.sendEmailChangeConfirmation(user.email, changeToken);
  }

  async confirmEmailChange(token: string): Promise<void> {
    const user = await this.repository.validateEmailChangeToken(token);
    if (!user) {
      throw new AppError("Invalid token", 400);
    }
    const session = await this.repository.startSession();
    session.startTransaction();
    try {
      await Promise.all([
        this.repository.processEmailChange(user._id.toString(), session),
        this.repository.createAuditLog(
          user._id.toString(),
          AuditAction.EMAIL_CHANGE_CONFIRMATION,
          {
            newEmail: user.verification.emailChange,
            success: true,
          },
          session
        ),
      ]);
      await session.commitTransaction();
    } catch (error) {
      this.repository.createAuditLog(
        user._id.toString(),
        AuditAction.EMAIL_CHANGE_FAILURE,
        {
          newEmail: user.verification.emailChange,
          success: false,
        }
      ),
        await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async deactivateAccount(userId: string): Promise<void> {
    this.repository.updateUserStatus(userId, UserStatus.INACTIVE);
  }

  async deleteAccount(userId: string): Promise<void> {
    await Promise.all([
      this.repository.delete(userId),
      this.sessionService.revokeAllSessions(userId),
    ]);
  }
  async updateName(userId: string, name: string): Promise<void> {
    await this.repository.updateName(userId, name);
  }
  // Admin Functions
  async getAllUsers(
    options: QueryOptionConfig
  ): Promise<QueryBuilderResult<IUser> | []> {
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
  async getActiveSessions(userId: string): Promise<ISession[]> {
    return this.sessionService.getUserSessions(userId);
  }

  async revokeSession(userId: string): Promise<void> {
    await this.sessionService.revokeSession(userId);
  }

  // async enableMFA(userId: string): Promise<{ secret: string; qrCode: string }> {
  //   return this.repository.enableMultiFactorAuth(userId);
  // }

  // async verifyMFA(
  //   userId: string,
  //   token: string
  // ): Promise<{ recoveryCodes: string[] }> {
  //   return this.repository.verifyMfaSetup(userId, token);
  // }
}
