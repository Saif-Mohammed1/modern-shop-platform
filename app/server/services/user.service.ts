import { type Knex } from "knex";
import { cookies } from "next/headers";

import {
  type AuditLogDetails,
  SecurityAuditAction,
} from "@/app/lib/types/audit.db.types";
import type {
  QueryBuilderResult,
  QueryOptionConfig,
} from "@/app/lib/types/queryBuilder.types";
import type { DeviceInfo } from "@/app/lib/types/session.types";
import {
  type ISessionDB,
  type IUserDB,
  type IUserJson,
  UserRole,
  type UserAuthType,
  UserStatus,
  type accountAction,
} from "@/app/lib/types/users.db.types";
import AppError from "@/app/lib/utilities/appError";
import { obfuscateEmail } from "@/app/lib/utilities/helpers";
import { lang } from "@/app/lib/utilities/lang";
import { generateVerificationToken } from "@/app/lib/utilities/user.utilty";
import { AuthTranslate } from "@/public/locales/server/Auth.Translate";
import { authControllerTranslate } from "@/public/locales/server/authControllerTranslate";
import { userControllerTranslate } from "@/public/locales/server/userControllerTranslate";

import { connectDB } from "../db/db";
import type {
  CreateUserByAdminDTO,
  UpdateUserByAdminDTO,
  UserChangePasswordDTO,
  UserCreateDTO,
} from "../dtos/user.dto";
// import UserModel from "../models/User.model";
import { UserRepository } from "../repositories/user.repository";

import { SessionService } from "./session.service";
import { TokensService } from "./tokens.service";

import { emailService } from ".";

export class UserService {
  constructor(
    private repository: UserRepository = new UserRepository(connectDB()),
    private sessionService: SessionService = new SessionService(),
    private tokensService: TokensService = new TokensService()
  ) {}
  async finalizeLogin(
    user: IUserDB,
    device_info: DeviceInfo,
    trx?: Knex.Transaction
  ): Promise<{
    user: UserAuthType;
    access_token: string;
    refreshToken: string;
  }> {
    const { access_token, refreshToken, hashed_token } =
      this.tokensService.generateAuthTokens(user._id.toString());

    await Promise.all([
      this.sessionService.createSession(
        user._id.toString(),
        device_info,
        hashed_token,
        this.tokensService.getRefreshTokenExpiry(),
        trx
      ),
      this.repository.updateLastLogin(user._id, trx),
      user.two_factor_enabled &&
        this.repository.clearTwoFactorSecret(String(user._id), trx),
    ]);
    await this.repository.clearRateLimit(user._id, "login", trx);
    await this.tokensService.setRefreshTokenCookies(refreshToken);
    // After successful authentication
    if (user.login_notification_sent) {
      await this.repository.detectAnomalies(user, device_info, trx);

      // if (user.security.behavioralFlags.impossible_travel) {
      //   await emailService.sendSecurityAlertEmail(user.email, {
      //     type: SecurityAlertType.IMPOSSIBLE_TRAVEL,
      //     location: `${device_info.location.city}, ${device_info.location.country} -> ${user.security.loginHistory[0].location.city}, ${user.security.loginHistory[0].location.country}`,
      //   });
      // }
    }
    return {
      user: this.filterForRole(user), //: user.filterForRole() as UserAuthType,
      access_token,
      refreshToken,
    };
  }
  async createUserByAdmin(dto: CreateUserByAdminDTO): Promise<UserAuthType> {
    const existingUser = await this.repository.findByEmail(dto.email);
    if (existingUser) {
      throw new AppError(
        userControllerTranslate[lang].errors.userAlreadyExist,
        400
      );
    }
    return await this.repository.transaction(async (trx) => {
      const user = await this.repository.createUserByAdmin(dto, trx);
      return this.filterForRole(user);
    });
  }
  async updateUserByAdmin(
    id: string,
    dto: UpdateUserByAdminDTO
  ): Promise<UserAuthType> {
    return await this.repository.transaction(async (trx) => {
      const user = await this.repository.updateUserByAdmin(id, dto, trx);
      if (!user) {
        throw new AppError(AuthTranslate[lang].errors.userNotFound, 404);
      }

      return this.filterForRole(user);
    });
  }
  // UserModel Registration
  async registerUser(dto: UserCreateDTO, device_info: DeviceInfo) {
    // const session = await this.repository.startSession();
    const existingUser = await this.repository.findByEmail(dto.email);
    if (existingUser) {
      throw new AppError(
        userControllerTranslate[lang].errors.userAlreadyExist,
        400
      );
    }
    const verification_token = generateVerificationToken();

    const user = await this.repository.transaction(async (trx) => {
      const createdUser = await this.repository.createUser(dto, trx);
      // Generate and send verification token
      await Promise.all([
        this.repository.setVerificationToken(
          createdUser._id.toString(),
          verification_token,
          trx
        ),
        // Audit log
        // console.log("pre createAuditLog");

        this.repository.createAuditLog(
          createdUser._id.toString(),
          SecurityAuditAction.REGISTRATION,
          {
            success: true,
            device: device_info,
            message: userControllerTranslate[lang].controllers.register.success,
          },
          trx
        ),
      ]);
      return createdUser;
    });
    if (process.env.NODE_ENV !== "development") {
      await emailService.sendVerification(user.email, verification_token);
    }
    return await this.repository.transaction(async (trx) => {
      return await this.finalizeLogin(user, device_info, trx);
    });
  }

  // UserModel Authentication
  async authenticateUser(
    email: string,
    password: string,

    device_info: DeviceInfo
  ): Promise<
    // | { user: IUserDB; access_token: string; refreshToken: string }
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
    await this.repository.checkRateLimit(user._id, "login");
    // if (user.isAccountLocked("login")) {
    //   throw new AppError("Account temporarily locked", 423);
    // }

    const isValid = await this.repository.comparePassword(user, password);
    await this.repository.trackLogin(user, device_info, isValid);
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

    if (user.two_factor_enabled) {
      await this.repository.checkRateLimit(user._id, "2fa");

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
    // const { access_token, refreshToken, hashed_token } =
    //   this.tokensService.generateAuthTokens(user._id.toString());
    // // Create new session
    // await Promise.all([
    //   this.sessionService.createSession(
    //     user._id.toString(),
    //     device_info,
    //     hashed_token,
    //     this.tokensService.getRefreshTokenExpiry()
    //   ),
    //   this.repository.updateLastLogin(user._id),
    // ]);
    // this.tokensService.setRefreshTokenCookies(refreshToken);

    // // Update last login

    // await this.repository.clearRateLimit(user, "login");
    // return { user, access_token, refreshToken };
    return await this.repository.transaction(async (trx) => {
      return await this.finalizeLogin(user, device_info, trx);
    });
  }
  async clearRateLimit(user: IUserDB, action: accountAction): Promise<void> {
    await this.repository.clearRateLimit(user._id, action);
  }
  async checkRateLimit(user: IUserDB, action: accountAction): Promise<void> {
    await this.repository.checkRateLimit(user._id, action);
  }

  async incrementRateLimit(
    user: IUserDB,
    action: accountAction
  ): Promise<void> {
    await this.repository.incrementRateLimit(user, action);
  }
  // Password Management
  async findUserById(
    user_id: string,
    trx?: Knex.Transaction
    // options?: string
  ): Promise<IUserDB> {
    const user = await this.repository.findById(user_id, trx);
    if (!user) {
      throw new AppError(AuthTranslate[lang].errors.userNotFound, 404);
    }
    return user;
  }
  async logOut(): Promise<{
    message: string;
  }> {
    await this.tokensService.clearRefreshTokenCookies();

    return { message: AuthTranslate[lang].auth.logOut.logOutSuccess };
  }
  async requestPasswordReset(
    email: string,
    device_info: DeviceInfo
  ): Promise<void> {
    const user = await this.repository.findByEmail(email);
    if (!user) {
      return;
    } // Don't reveal user existence
    const resetToken = await this.repository.transaction(async (trx) => {
      await this.repository.checkRateLimit(user._id, "passwordReset");

      const resetToken = await this.repository.generatePasswordResetToken(
        user._id.toString(),
        trx
      );

      await this.repository.createAuditLog(
        user._id.toString(),
        SecurityAuditAction.PASSWORD_RESET_REQUEST,
        {
          device: device_info,
          success: true,
          message:
            AuthTranslate[lang].auth.requestPasswordReset.AuditLog.message,
        },
        trx
      );

      await this.repository.incrementRateLimit(user, "passwordReset", trx);
      return resetToken;
    });
    // await EmailService.passwordReset.sendPasswordReset(user.email, resetToken);
    await emailService.sendPasswordReset(user.email, resetToken);
  }
  async forcePasswordResetByAdmin(
    id: string,
    device_info: DeviceInfo
  ): Promise<void> {
    const user = await this.repository.findById(id);
    if (!user) {
      return;
    } // Don't reveal user existence

    const password = this.tokensService.generateForceRestPassword();

    await this.repository.transaction(async (trx) => {
      await Promise.all([
        this.repository.updatePassword(user._id, password, trx),

        // await EmailService.passwordReset.sendPasswordReset(user.email, resetToken);
        this.repository.createAuditLog(
          user._id.toString(),
          SecurityAuditAction.FORCE_PASSWORD_RESET,
          {
            success: true,
            device: device_info,
            message:
              AuthTranslate[lang].auth.forcePasswordReset.AuditLog.message,
          },
          trx
        ),
      ]);
    });
    await emailService.forcePasswordReset(user.email, password);
  }

  async validateEmailAndToken(token: string, _email: string): Promise<boolean> {
    const user = await this.repository.validateResetPasswordEmailAndToken(
      token
      // email
    );
    if (!user) {
      throw new AppError(
        AuthTranslate[lang].userService.validateEmailAndToken.invalidToken,
        400
      );
    }
    return true;
  }
  async findUserByEmail(email: string): Promise<IUserDB | null> {
    return await this.repository.findByEmail(email);
  }
  async validatePasswordResetToken(
    token: string,
    // email: string,
    newPassword: string,
    device_info: DeviceInfo
  ): Promise<void> {
    const user_id = await this.repository.validateResetPasswordEmailAndToken(
      token
      // email
    );
    if (!user_id) {
      throw new AppError(
        AuthTranslate[lang].userService.validateEmailAndToken.invalidToken,
        400
      );
    }

    // 4. Check against previous passwords
    if (await this.repository.isPreviousPassword(user_id, newPassword)) {
      throw new AppError(
        AuthTranslate[lang].userService.isPreviousPassword.passwordMatch,
        400
      );
    }
    await this.repository.transaction(async (trx) => {
      await Promise.all([
        // 5. Update password and invalidate token
        this.repository.updatePassword(user_id, newPassword, trx),
        this.repository.invalidateResetToken(user_id, trx),
        this.repository.clearRateLimit(user_id, "passwordReset"),

        this.repository.createAuditLog(
          user_id,
          SecurityAuditAction.PASSWORD_RESET,
          {
            device: device_info,
            success: true,
            message:
              AuthTranslate[lang].auth.resetPassword.passwordResetSuccess,
          },
          trx
        ),
      ]);
    });
    // await Promise.all([
    //   this.repository.updatePassword(user, newPassword, session),
    //   this.repository.invalidateResetToken(user._id.toString(), session),
    //   this.repository.createAuditLog(
    //     user._id.toString(),
    //     SecurityAuditAction.PASSWORD_RESET,
    //     {
    //       device: device_info,
    //     },
    //     session
    //   ),
    // ]);
    // 6. Send security notification
    const user = await this.repository.findById(user_id);
    if (!user) {
      throw new AppError(AuthTranslate[lang].errors.userNotFound, 404);
    }
    await emailService.sendPasswordChangeConfirmation(user.email);
  }
  // async confirmPasswordReset(
  //   newPassword: string,
  //   confirmNewPassword: string,
  // ): Promise<void> {
  //   if (newPassword !== confirmNewPassword) {
  //     throw new AppError("Passwords do not match", 400);
  //   }
  //     await this.repository.updatePassword(user_id, newPassword);
  //   }
  async createAuditLog(
    user_id: string,
    action: SecurityAuditAction,
    details: AuditLogDetails,
    session?: Knex.Transaction
  ): Promise<void> {
    await this.repository.createAuditLog(user_id, action, details, session);
  }
  async changePassword(
    user_id: string,
    dto: UserChangePasswordDTO
  ): Promise<void> {
    const user = await this.repository.findById(user_id);
    if (!user) {
      throw new AppError(AuthTranslate[lang].errors.userNotFound, 404);
    }
    if (!(await this.repository.comparePassword(user, dto.currentPassword))) {
      throw new AppError(
        AuthTranslate[lang].errors.currentPasswordNotMatch,
        400
      );
    }
    if (await this.repository.isPreviousPassword(user._id, dto.newPassword)) {
      throw new AppError(AuthTranslate[lang].errors.isPreviousPassword, 400);
    }
    await this.repository.updatePassword(user._id, dto.newPassword);
  }

  // Email Verification
  async sendVerificationCode(
    user_id: string,
    device_info: DeviceInfo
  ): Promise<void> {
    const user = await this.repository.findById(user_id);
    if (!user) {
      throw new AppError(AuthTranslate[lang].errors.userNotFound, 404);
    }
    if (user.email_verified) {
      throw new AppError(AuthTranslate[lang].errors.email_verified, 400);
    }

    await this.repository.checkRateLimit(user._id, "verification");
    try {
      await this.regenerateVerificationCode(user, device_info);
    } catch (error) {
      await this.repository.createAuditLog(
        user._id.toString(),
        SecurityAuditAction.VERIFICATION_EMAIL_FAILURE,
        {
          success: false,
          message: (error as Error).message || "undefined",
          device: device_info,
        }
      );
    }
    await this.repository.incrementRateLimit(user, "verification");
  }
  async regenerateVerificationCode(
    user: IUserDB,
    device_info: DeviceInfo
  ): Promise<void> {
    const verification_token = generateVerificationToken();
    const hashed_token =
      this.tokensService.hashVerificationToken(verification_token);
    await this.repository.transaction(async (trx) => {
      await Promise.all([
        this.repository.setVerificationToken(
          user._id.toString(),
          hashed_token,
          trx
        ),
        this.repository.createAuditLog(
          user._id.toString(),
          SecurityAuditAction.VERIFICATION_EMAIL_REQUEST,
          {
            success: true,
            device: device_info,
            message: AuthTranslate[lang].auth.verificationEmailRequest.message,
          },
          trx
        ),
      ]);
    });
    await emailService.sendVerification(user.email, verification_token);
  }
  // await Promise.all([
  //   this.repository.setVerificationToken(
  //     user._id.toString(),
  //     verification_token
  //   ),
  //   this.repository.createAuditLog(
  //     user._id.toString(),
  //     SecurityAuditAction.VERIFICATION_EMAIL_REQUEST,
  //     {
  //       success: true,
  //     }
  //   ),
  //   emailService.sendVerification(user.email, verification_token),
  // ]);

  async verifyEmail(
    user_id: string,
    token: string,
    device_info: DeviceInfo
  ): Promise<UserAuthType | null> {
    const user = await this.repository.findById(user_id);
    if (!user) {
      throw new AppError(AuthTranslate[lang].errors.userNotFound, 404);
    }
    await this.repository.checkRateLimit(user._id, "verification");
    if (user.email_verified) {
      throw new AppError(AuthTranslate[lang].errors.email_verified, 400);
    }
    try {
      const hashed_token = this.tokensService.hashVerificationToken(token);
      const isVerify = await this.repository.verifyUserEmail(hashed_token);
      if (!isVerify?.email_verified) {
        throw new AppError(AuthTranslate[lang].errors.invalidToken, 400);
      }
      await this.repository.clearRateLimit(user._id, "verification");
      return this.filterForRole(isVerify);
    } catch (error) {
      await this.repository.createAuditLog(
        user._id.toString(),
        SecurityAuditAction.VERIFICATION_EMAIL_FAILURE,
        {
          success: false,
          message: (error as Error).message || "undefined",
          device: device_info,
        }
      );
      await this.repository.incrementRateLimit(user, "verification");
      throw error;
    }
  }
  async disable2FA(user_id: string, trx?: Knex.Transaction): Promise<void> {
    await this.repository.disable2FA(user_id, trx);
  }
  async enable2FA(user_id: string, trx?: Knex.Transaction): Promise<void> {
    await this.repository.enable2FA(user_id, trx);
  }
  async validateTempToken(tempToken: string): Promise<IUserDB> {
    const user = await this.repository.validateTempToken(tempToken);
    if (!user) {
      throw new AppError(AuthTranslate[lang].errors.invalidToken, 400);
    }
    return user; //his.filterForRole(user);
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
    const security = await this.repository.validateGenerateMFAToken(user._id);
    if (
      security?.two_factor_secret &&
      security?.two_factor_secret_expiry &&
      security?.two_factor_secret_expiry > new Date(Date.now())
    ) {
      return security.two_factor_secret;
      // return {
      //   // message: "Temporary token generated",
      //   tempToken: user.security.two_factor_secret,
      //   tempTokenExpires: user.security.two_factor_secret_expiry,
      // };
    }
    await this.repository.checkRateLimit(user._id, "2fa");

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
  // async updateProfile(user_id: string, dto: UserUpdateDTO): Promise<IUserDB> {
  //  return await this.repository.updateUser(user_id, dto);
  // }
  async requestEmailChange(
    user_id: string,
    newEmail: string,
    device_info: DeviceInfo
  ): Promise<void> {
    const existingUser = await this.repository.findByEmail(newEmail);
    if (existingUser) {
      throw new AppError(
        AuthTranslate[lang].errors.emailAlreadyInUse,

        409
      );
    }
    const user = await this.repository.findById(user_id);
    if (!user) {
      throw new AppError(AuthTranslate[lang].errors.userNotFound, 404);
    }
    const changeToken = await this.repository.generateEmailChangeToken(
      user_id,
      newEmail
    );
    await this.repository.createAuditLog(
      user_id,
      SecurityAuditAction.EMAIL_CHANGE_REQUEST,
      {
        success: true,
        device: device_info,
        message: AuthTranslate[lang].auth.emailChangeRequest.message,
      }
    );
    await emailService.sendEmailChangeConfirmation(user.email, changeToken);
  }

  async confirmEmailChange(
    token: string,
    device_info: DeviceInfo
  ): Promise<void> {
    const user = await this.repository.validateEmailChangeToken(token);
    if (!user) {
      throw new AppError(AuthTranslate[lang].errors.invalidToken, 400);
    }
    await this.repository.transaction(async (trx) => {
      try {
        await Promise.all([
          this.repository.processEmailChange(user.user_id, trx),
          this.repository.createAuditLog(
            user.user_id,
            SecurityAuditAction.EMAIL_CHANGE_CONFIRMATION,
            {
              message: AuthTranslate[lang].auth.emailChangeConfirmation.message,
              success: true,
              device: device_info,
            },
            trx
          ),
        ]);
      } catch (error) {
        await this.repository.createAuditLog(
          user.user_id,
          SecurityAuditAction.EMAIL_CHANGE_FAILURE,
          {
            success: false,
            message: (error as Error).message || "undefined",

            device: device_info,
          }
        );
        throw error;
      }
    });
  }

  async deactivateAccount(user_id: string): Promise<void> {
    await Promise.all([
      this.repository.updateUserStatus(user_id, UserStatus.SUSPENDED),
      this.sessionService.revokeAllSessions(user_id),
      this.logOut(),
    ]);
  }

  // async deleteAccount(user_id: string): Promise<void> {
  //   await Promise.all([
  //     this.repository.delete(user_id),
  //     this.sessionService.revokeAllSessions(user_id),
  //   ]);
  // }
  async updateName(user_id: string, name: string): Promise<void> {
    await this.repository.updateName(user_id, name);
  }
  async updateLoginNotificationSent(
    user_id: string,
    result: boolean
  ): Promise<void> {
    await this.repository.updateLoginNotificationSent(user_id, result);
  }
  // Admin Functions
  async getAllUsers(
    options: QueryOptionConfig
  ): Promise<QueryBuilderResult<IUserDB>> {
    return await this.repository.findAllUsers(options);
  }

  async updateUserRole(user_id: string, role: UserRole): Promise<void> {
    await this.repository.updateUserRole(user_id, role);
  }

  async suspendUser(user_id: string): Promise<void> {
    await this.sessionService.revokeAllSessions(user_id);
    await this.repository.updateUserStatus(user_id, UserStatus.SUSPENDED);
  }
  async deleteUserByAdmin(user_id: string): Promise<void> {
    await this.repository.transaction(async (trx) => {
      await Promise.all([
        this.sessionService.revokeAllSessionsByAdmin(user_id, trx),
        this.repository.updateUserStatus(user_id, UserStatus.DELETED, trx),
      ]);
    });
  }
  async logSecurityAlert(
    email: string,
    type: SecurityAuditAction,
    details: AuditLogDetails
  ): Promise<void> {
    await this.repository.logSecurityAlert(email, type, details);
  }
  // Security Functions
  async getActiveSessions(
    user_id: string
  ): Promise<QueryBuilderResult<ISessionDB>> {
    return await this.sessionService.getUserSessions(user_id);
  }

  async revokeSession(user_id: string): Promise<void> {
    await this.sessionService.revokeSession(user_id);
  }
  async revokeAllSessionsByAdmin(
    user_id: string,
    device_info: DeviceInfo
  ): Promise<void> {
    await this.repository.transaction(async (trx) => {
      await Promise.all([
        this.sessionService.revokeAllSessionsByAdmin(user_id, trx),
        this.repository.createAuditLog(
          user_id,
          SecurityAuditAction.REVOKE_ALL_SESSIONS,
          {
            success: true,
            device: device_info,
            message: AuthTranslate[lang].auth.revokeAllSessions.message,
          },
          trx
        ),
      ]);
    });
  }
  async lockUserAccountByAdmin(
    user_id: string,
    device_info: DeviceInfo
  ): Promise<void> {
    await this.repository.transaction(async (trx) => {
      await Promise.all([
        this.repository.lockUserAccount(user_id, trx),
        this.repository.createAuditLog(
          user_id,
          SecurityAuditAction.ACCOUNT_LOCKED,
          {
            success: true,
            device: device_info,
            message: AuthTranslate[lang].auth.lockUserAccount.message,
          },
          trx
        ),
      ]);
    });
  }
  async unlockUserAccountByAdmin(
    user_id: string,
    device_info: DeviceInfo
  ): Promise<void> {
    await this.repository.transaction(async (trx) => {
      await Promise.all([
        this.repository.unlockUserAccount(user_id, trx),
        this.repository.createAuditLog(
          user_id,
          SecurityAuditAction.ACCOUNT_UNLOCKED,
          {
            success: true,
            device: device_info,
            message: AuthTranslate[lang].auth.unlockUserAccount.message,
          },
          trx
        ),
      ]);
    });
  }
  // async enableMFA(user_id: string): Promise<{ secret: string; qrCode: string }> {
  //  return await this.repository.enableMultiFactorAuth(user_id);
  // }

  // async verifyMFA(
  //   user_id: string,
  //   token: string
  // ): Promise<{ recoveryCodes: string[] }> {
  //  return await this.repository.verifyMfaSetup(user_id, token);
  // }
  filterForRole(
    user: Omit<IUserDB, "password">,
    currentUserRole: UserRole = UserRole.CUSTOMER
  ): UserAuthType {
    // Remove sensitive fields
    const { password, phone_verified, email_verified, ...userObject } =
      user as IUserJson;

    // Apply role-specific transformations
    if ([UserRole.ADMIN, UserRole.MODERATOR].includes(currentUserRole)) {
      // Anonymize security data for admin view
      if (userObject.password_changed_at) {
        userObject.password_changed_at = new Date(
          userObject.password_changed_at
        )
          ?.toISOString()
          .split("T")[0];
      }
      if (userObject.last_login) {
        userObject.last_login = new Date(userObject.last_login)
          ?.toISOString()
          .split("T")[0]; // Truncate timestamp
      }

      // const security = await this.anonymizeSecurityData(userObject._id);
    } else {
      // Non-admin/moderator view
      userObject.email = obfuscateEmail(userObject.email);

      if (userObject.updated_at) {
        delete userObject.updated_at;
      }
    }

    // Remove sensitive fields from social profiles
    // if (
    //   userObject.socialProfiles &&
    //   Object.keys(userObject.socialProfiles).length === 0
    // ) {
    //   delete userObject.socialProfiles;
    // }

    return {
      ...userObject,
      verification: {
        email_verified: email_verified,
        phone_verified: phone_verified,
      },
      created_at: new Date(userObject.created_at)?.toISOString().split("T")[0],
    };
  }
}
