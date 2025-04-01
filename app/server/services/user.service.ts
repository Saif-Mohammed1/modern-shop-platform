import AppError from "@/app/lib/utilities/appError";
import { userControllerTranslate } from "@/public/locales/server/userControllerTranslate";
import { lang } from "@/app/lib/utilities/lang";
import { generateVerificationToken } from "@/app/lib/utilities/user.utilty";
import type { DeviceInfo } from "@/app/lib/types/session.types";
import { UserRepository } from "../repositories/user.repository";
import { SecurityAlertType } from "@/app/server/services/email.service";
import type {
  CreateUserByAdminDTO,
  UpdateUserByAdminDTO,
  UserChangePasswordDTO,
  UserCreateDTO,
} from "../dtos/user.dto";
import { cookies } from "next/headers";
import { authControllerTranslate } from "@/public/locales/server/authControllerTranslate";
import {
  SecurityAuditAction,
  type AuditLogDetails,
} from "@/app/lib/types/audit.types";
import UserModel, { type IUser } from "../models/User.model";
import {
  type accountAction,
  type UserAuthType,
  UserRole,
  UserStatus,
} from "@/app/lib/types/users.types";
import { SessionService } from "./session.service";
import { TokensService } from "./tokens.service";
import { AuthTranslate } from "@/public/locales/server/Auth.Translate";
import type { ISession } from "../models/Session.model";
import type {
  QueryBuilderResult,
  QueryOptionConfig,
} from "@/app/lib/types/queryBuilder.types";
import type { ClientSession } from "mongoose";
import { emailService } from ".";
export class UserService {
  constructor(
    private repository: UserRepository = new UserRepository(UserModel),
    private sessionService: SessionService = new SessionService(),
    private tokensService: TokensService = new TokensService()
  ) {}
  async finalizeLogin(
    user: IUser,
    deviceInfo: DeviceInfo
  ): Promise<{
    user: UserAuthType;
    accessToken: string;
    refreshToken: string;
  }> {
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
    await this.tokensService.setRefreshTokenCookies(refreshToken);
    await this.repository.clearRateLimit(user, "login");
    // After successful authentication
    if (user.loginNotificationSent) {
      user.detectAnomalies(deviceInfo);

      if (user.security.behavioralFlags.impossibleTravel) {
        await emailService.sendSecurityAlertEmail(user.email, {
          type: SecurityAlertType.IMPOSSIBLE_TRAVEL,
          location: `${deviceInfo.location.city}, ${deviceInfo.location.country} -> ${user.security.loginHistory[0].location.city}, ${user.security.loginHistory[0].location.country}`,
        });
      }
    }
    return {
      user: user.filterForRole() as UserAuthType,
      accessToken,
      refreshToken,
    };
  }
  async createUserByAdmin(dto: CreateUserByAdminDTO): Promise<IUser> {
    const session = await this.repository.startSession();
    session.startTransaction();
    try {
      const existingUser = await this.repository.findByEmail(dto.email);
      if (existingUser) {
        throw new AppError(
          userControllerTranslate[lang].errors.userAlreadyExist,
          400
        );
      }
      const user = await this.repository.createUserByAdmin(dto, session);
      await session.commitTransaction();
      return user;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
  async updateUserByAdmin(
    id: string,
    dto: UpdateUserByAdminDTO
  ): Promise<IUser> {
    const session = await this.repository.startSession();
    session.startTransaction();

    try {
      const user = await this.repository.updateUserByAdmin(id, dto, session);
      if (!user) {
        throw new AppError(AuthTranslate[lang].errors.userNotFound, 404);
      }
      await session.commitTransaction();
      return user;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
  // UserModel Registration
  async registerUser(dto: UserCreateDTO, deviceInfo: DeviceInfo) {
    const session = await this.repository.startSession();
    session.startTransaction();
    try {
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
      await this.repository.setVerificationToken(
        user._id.toString(),
        verificationToken,
        session
      );

      await emailService.sendVerification(user.email, verificationToken);
      // Audit log
      await this.repository.createAuditLog(
        user._id.toString(),
        SecurityAuditAction.REGISTRATION,
        {
          success: true,
          device: deviceInfo,
        },
        session
      );
      await session.commitTransaction();
      return await this.finalizeLogin(user, deviceInfo);
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
    // | { user: IUser; accessToken: string; refreshToken: string }
    | ReturnType<typeof this.finalizeLogin>
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
      (await cookies()).set("tempToken", tempToken, {
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
    return await this.finalizeLogin(user, deviceInfo);
  }
  async clearRateLimit(user: IUser, action: accountAction): Promise<void> {
    await this.repository.clearRateLimit(user, action);
  }

  async incrementRateLimit(user: IUser, action: accountAction): Promise<void> {
    await this.repository.incrementRateLimit(user, action);
  }
  // Password Management
  async findUserById(userId: string, options?: string): Promise<IUser | null> {
    return await this.repository.findUserById(userId, options);
  }
  async logOut(): Promise<{
    message: string;
  }> {
    await this.tokensService.clearRefreshTokenCookies();

    return { message: AuthTranslate[lang].auth.logOut.logOutSuccess };
  }
  async requestPasswordReset(
    email: string,
    deviceInfo: DeviceInfo
  ): Promise<void> {
    const session = await this.repository.startSession();
    session.startTransaction();
    try {
      const user = await this.repository.findByEmail(email);
      if (!user) return; // Don't reveal user existence
      user.checkRateLimit("passwordReset");

      const resetToken = await this.repository.generatePasswordResetToken(
        user._id.toString(),
        session
      );

      // await EmailService.passwordReset.sendPasswordReset(user.email, resetToken);
      await emailService.sendPasswordReset(user.email, resetToken);
      await this.repository.createAuditLog(
        user._id.toString(),
        SecurityAuditAction.PASSWORD_RESET_REQUEST,
        { device: deviceInfo, success: true },
        session
      );

      await this.repository.incrementRateLimit(user, "passwordReset", session);
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();

      throw error;
    } finally {
      session.endSession();
    }
  }
  async forcePasswordResetByAdmin(id: string): Promise<void> {
    const session = await this.repository.startSession();
    session.startTransaction();
    try {
      const user = await this.repository.findUserById(id, "+password");
      if (!user) return; // Don't reveal user existence

      const password = this.tokensService.generateForceRestPassword();
      user.password = password;
      await user.save({ session });
      // await EmailService.passwordReset.sendPasswordReset(user.email, resetToken);
      await emailService.forcePasswordReset(user.email, password);
      await this.repository.createAuditLog(
        user._id.toString(),
        SecurityAuditAction.FORCE_PASSWORD_RESET,
        { success: true },
        session
      );
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
    return await this.repository.findByEmail(email);
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
        SecurityAuditAction.PASSWORD_RESET,
        {
          device: deviceInfo,
          success: true,
        },
        session
      );
      // await Promise.all([
      //   this.repository.updatePassword(user, newPassword, session),
      //   this.repository.invalidateResetToken(user._id.toString(), session),
      //   this.repository.createAuditLog(
      //     user._id.toString(),
      //     SecurityAuditAction.PASSWORD_RESET,
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
    action: SecurityAuditAction,
    details: AuditLogDetails,
    session?: ClientSession
  ): Promise<void> {
    return await this.repository.createAuditLog(
      userId,
      action,
      details,
      session
    );
  }
  async changePassword(
    userId: string,
    dto: UserChangePasswordDTO
  ): Promise<void> {
    const user = await this.repository.findUserById(userId);
    if (!user) {
      throw new AppError(AuthTranslate[lang].errors.userNotFound, 404);
    }
    if (!(await user.comparePassword(dto.currentPassword))) {
      throw new AppError(
        AuthTranslate[lang].errors.currentPasswordNotMatch,
        400
      );
    }
    if (await user.isPreviousPassword(dto.newPassword)) {
      throw new AppError(AuthTranslate[lang].errors.isPreviousPassword, 400);
    }
    await this.repository.updatePassword(user, dto.newPassword);
  }

  // Email Verification
  async sendVerificationCode(userId: string): Promise<void> {
    const user = await this.repository.findUserById(userId);
    if (!user) {
      throw new AppError(AuthTranslate[lang].errors.userNotFound, 404);
    }
    if (user?.verification.emailVerified) {
      throw new AppError(AuthTranslate[lang].errors.emailVerified, 400);
    }

    user.checkRateLimit("verification");
    try {
      await this.regenerateVerificationCode(user);
    } catch (error) {
      await this.repository.createAuditLog(
        user._id.toString(),
        SecurityAuditAction.VERIFICATION_EMAIL_FAILURE,
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
      await this.repository.setVerificationToken(
        user._id.toString(),
        hashedToken,
        session
      );
      await emailService.sendVerification(user.email, verificationToken);
      await this.repository.createAuditLog(
        user._id.toString(),
        SecurityAuditAction.VERIFICATION_EMAIL_REQUEST,
        {
          success: true,
        },
        session
      );
    });
  }
  // await Promise.all([
  //   this.repository.setVerificationToken(
  //     user._id.toString(),
  //     verificationToken
  //   ),
  //   this.repository.createAuditLog(
  //     user._id.toString(),
  //     SecurityAuditAction.VERIFICATION_EMAIL_REQUEST,
  //     {
  //       success: true,
  //     }
  //   ),
  //   emailService.sendVerification(user.email, verificationToken),
  // ]);

  async verifyEmail(userId: string, token: string): Promise<IUser | null> {
    const user = await this.repository.findUserById(userId);
    if (!user) {
      throw new AppError(AuthTranslate[lang].errors.userNotFound, 404);
    }
    user.checkRateLimit("verification");
    if (user.verification.emailVerified) {
      throw new AppError(AuthTranslate[lang].errors.emailVerified, 400);
    }
    try {
      const hashedToken = this.tokensService.hashVerificationToken(token);
      const isVerify = await this.repository.verifyUserEmail(hashedToken);
      if (!isVerify?.verification.emailVerified) {
        throw new AppError(AuthTranslate[lang].errors.invalidToken, 400);
      }
      await this.repository.clearRateLimit(user, "verification");
      return isVerify;
    } catch (error) {
      await this.repository.createAuditLog(
        user._id.toString(),
        SecurityAuditAction.VERIFICATION_EMAIL_FAILURE,
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
      throw new AppError(AuthTranslate[lang].errors.invalidToken, 400);
    }
    return user;
  }
  async generateSessionToken(email: string): Promise<string> {
    // <{
    //   // message: string;
    //   tempToken: string;
    //   // tempTokenExpires: Date;
    // }>
    const user = await this.repository.findByEmail(email);

    if (!user) {
      throw new AppError(AuthTranslate[lang].errors.userNotFound, 404);
    }

    if (
      user.security.twoFactorSecret &&
      user?.security?.twoFactorSecretExpiry &&
      user.security.twoFactorSecretExpiry > new Date(Date.now())
    ) {
      return user.security.twoFactorSecret;
      // return {
      //   // message: "Temporary token generated",
      //   tempToken: user.security.twoFactorSecret,
      //   tempTokenExpires: user.security.twoFactorSecretExpiry,
      // };
    }
    user.checkRateLimit("2fa");

    const tempToken = await this.repository.generateMFAToken(
      user._id.toString()
    );
    const expires = new Date(Date.now() + 1000 * 60 * 5);
    (await cookies()).set("tempToken", tempToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      expires,
      path: "/",
    });
    await this.repository.incrementRateLimit(user, "2fa");
    // return {
    //   message: "Temporary token generated",
    //   tempToken,
    //   tempTokenExpires: expires,
    // };
    return tempToken;
  }
  // Account Management
  // async updateProfile(userId: string, dto: UserUpdateDTO): Promise<IUser> {
  //  return await this.repository.updateUser(userId, dto);
  // }
  async requestEmailChange(
    userId: string,
    newEmail: string,
    deviceInfo: DeviceInfo
  ): Promise<void> {
    const existingUser = await this.repository.findByEmail(newEmail);
    if (existingUser) {
      throw new AppError(
        AuthTranslate[lang].errors.emailAlreadyInUse,

        409
      );
    }
    const user = await this.repository.findUserById(userId);
    if (!user) {
      throw new AppError(AuthTranslate[lang].errors.userNotFound, 404);
    }
    const changeToken = await this.repository.generateEmailChangeToken(
      userId,
      newEmail
    );
    await this.repository.createAuditLog(
      userId,
      SecurityAuditAction.EMAIL_CHANGE_REQUEST,
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
      throw new AppError(AuthTranslate[lang].errors.invalidToken, 400);
    }
    const session = await this.repository.startSession();
    session.startTransaction();
    try {
      await this.repository.processEmailChange(user._id.toString(), session);
      await this.repository.createAuditLog(
        user._id.toString(),
        SecurityAuditAction.EMAIL_CHANGE_CONFIRMATION,
        {
          newEmail: user.verification.emailChange,
          success: true,
        },
        session
      );
      await session.commitTransaction();
    } catch (error) {
      this.repository.createAuditLog(
        user._id.toString(),
        SecurityAuditAction.EMAIL_CHANGE_FAILURE,
        {
          newEmail: user.verification.emailChange,
          success: false,
        }
      );
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async deactivateAccount(userId: string): Promise<void> {
    await this.repository.updateUserStatus(userId, UserStatus.SUSPENDED);
  }

  // async deleteAccount(userId: string): Promise<void> {
  //   await Promise.all([
  //     this.repository.delete(userId),
  //     this.sessionService.revokeAllSessions(userId),
  //   ]);
  // }
  async updateName(userId: string, name: string): Promise<void> {
    await this.repository.updateName(userId, name);
  }
  async updateLoginNotificationSent(
    userId: string,
    result: boolean
  ): Promise<void> {
    await this.repository.updateLoginNotificationSent(userId, result);
  }
  // Admin Functions
  async getAllUsers(
    options: QueryOptionConfig
  ): Promise<QueryBuilderResult<IUser>> {
    return await this.repository.findAllUsers(options);
  }

  async updateUserRole(userId: string, role: UserRole): Promise<void> {
    this.repository.updateUserRole(userId, role);
  }

  async suspendUser(userId: string): Promise<void> {
    await this.sessionService.revokeAllSessions(userId);
    await this.repository.updateUserStatus(userId, UserStatus.SUSPENDED);
  }
  async deleteUserByAdmin(userId: string): Promise<void> {
    const session = await this.repository.startSession();
    session.startTransaction();
    try {
      await this.sessionService.revokeAllSessionsByAdmin(userId, session);
      await this.repository.updateUserStatus(
        userId,
        UserStatus.DELETED,
        session
      );
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
  async logSecurityAlert(
    email: string,
    type: SecurityAlertType,
    details: AuditLogDetails
  ): Promise<void> {
    await this.repository.logSecurityAlert(email, type, details);
  }
  // Security Functions
  async getActiveSessions(
    userId: string
  ): Promise<QueryBuilderResult<ISession>> {
    return await this.sessionService.getUserSessions(userId);
  }

  async revokeSession(userId: string): Promise<void> {
    await this.sessionService.revokeSession(userId);
  }
  async revokeAllSessionsByAdmin(userId: string): Promise<void> {
    const session = await this.repository.startSession();
    session.startTransaction();
    try {
      await this.sessionService.revokeAllSessionsByAdmin(userId, session);
      await this.repository.createAuditLog(
        userId,
        SecurityAuditAction.REVOKE_ALL_SESSIONS,
        {
          success: true,
        },
        session
      );
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
  async lockUserAccount(userId: string): Promise<void> {
    const session = await this.repository.startSession();
    session.startTransaction();
    try {
      await this.repository.lockUserAccount(userId);
      await this.repository.createAuditLog(
        userId,
        SecurityAuditAction.ACCOUNT_LOCKED,
        {
          success: true,
        },
        session
      );
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
  async unlockUserAccount(userId: string): Promise<void> {
    const session = await this.repository.startSession();
    session.startTransaction();
    try {
      await this.repository.unlockUserAccount(userId);
      await this.repository.createAuditLog(
        userId,
        SecurityAuditAction.ACCOUNT_UNLOCKED,
        {
          success: true,
        },
        session
      );
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
  // async enableMFA(userId: string): Promise<{ secret: string; qrCode: string }> {
  //  return await this.repository.enableMultiFactorAuth(userId);
  // }

  // async verifyMFA(
  //   userId: string,
  //   token: string
  // ): Promise<{ recoveryCodes: string[] }> {
  //  return await this.repository.verifyMfaSetup(userId, token);
  // }
}
