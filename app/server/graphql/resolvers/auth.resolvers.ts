import { getDeviceFingerprint } from "@/app/lib/utilities/DeviceFingerprint.utility";
import { lang } from "@/app/lib/utilities/lang";
import { AuthTranslate } from "@/public/locales/server/Auth.Translate";

import { UserValidation, type UserCreateDTO } from "../../dtos/user.dto";
import { AuthMiddleware } from "../../middlewares/auth.middleware";
import { TwoFactorService } from "../../services/2fa.service";
import { UserService } from "../../services/user.service";
import type { Context } from "../apollo-server";

// Type definitions for LoginResponse union
interface UserResult {
  user: object;
  access_token: string;
  refreshToken: string;
}

interface TwoFALoginType {
  requires2FA: boolean;
  tempToken: string;
  expires: string;
  message?: string;
}

type LoginResponseType = UserResult | TwoFALoginType;

const userService: UserService = new UserService();
const twoFactorService: TwoFactorService = new TwoFactorService();
export const authResolvers = {
  LoginResponse: {
    __resolveType(obj: LoginResponseType): string | null {
      // If the object has a 'user' property, it's a UserResult
      if ("user" in obj) {
        return "UserResult";
      }
      // If the object has a 'requires2FA' property, it's a TwoFALoginType
      if ("requires2FA" in obj) {
        return "TwoFALoginType";
      }
      // Default fallback
      return null;
    },
  },
  Query: {
    getActiveSessions: async (
      _parent: unknown,
      _args: unknown,
      { req }: Context
    ) => {
      await AuthMiddleware.requireAuth([])(req);
      const sessions = await userService.getActiveSessions(
        req.user?._id.toString()!
      );
      return sessions;
    },

    getTwoFactorAuditLogs: async (
      _parent: unknown,
      _args: unknown,
      { req }: Context
    ) => {
      await AuthMiddleware.requireAuth([])(req);
      const userId = req.user?._id.toString()!;

      const logs = await twoFactorService.getAuditLogs(userId);
      return logs.map((log) => ({
        timestamp: log.timestamp,
        action: log.action,
        metadata: "{}",
      }));
    },
  },
  Mutation: {
    registerUser: async (
      _parent: unknown,
      { input }: { input: UserCreateDTO },
      { req }: Context
    ) => {
      const userData = UserValidation.validateUserCreateDTO(input);
      const device_info = await getDeviceFingerprint(req);
      return await userService.registerUser(userData, device_info);
    },
    loginUser: async (
      _parent: unknown,
      { email, password }: { email: string; password: string },
      { req }: Context
    ) => {
      const result = UserValidation.validateLogin({
        email,
        password,
      });
      const device_info = await getDeviceFingerprint(req);

      return await userService.authenticateUser(
        result.email,
        result.password,
        device_info
      );
      //   if ("requires2FA" in authResult) {
      //     return {
      //       requires2FA: true,
      //       tempToken: authResult.tempToken,
      //       expires: authResult.expires,
      //       message: authResult.message,
      //     };
      //   }
    },
    logoutUser: async (_parent: unknown, _args: unknown, _context: Context) => {
      // const device_info = await getDeviceFingerprint(req);
      await userService.logOut();
      // await this.userService.logOut(req.user?._id, device_info);

      return { message: AuthTranslate[lang].auth.logOut.logOutSuccess };
    },
    forgotPassword: async (
      _parent: unknown,
      { email }: { email: string },
      { req }: Context
    ) => {
      const result = UserValidation.isEmailValid(email);
      const device_info = await getDeviceFingerprint(req);

      await userService.requestPasswordReset(result, device_info);
      return {
        message: AuthTranslate[lang].auth.forgotPassword.passwordResetLinkSent,
      };
    },
    isEmailAndTokenValid: async (
      _parent: unknown,
      { email, token }: { email: string; token: string },
      _context: Context
    ) => {
      const result = UserValidation.validateEmailAndToken({ token, email });
      await userService.validateEmailAndToken(result.token, result.email);
      return {
        message: AuthTranslate[lang].auth.isEmailAndTokenValid.tokenIsValid,
      };
    },
    resetPassword: async (
      _parent: unknown,
      {
        input,
      }: {
        input: {
          email: string;
          token: string;
          password: string;
          confirmPassword: string;
        };
      },
      { req }: Context
    ) => {
      const device_info = await getDeviceFingerprint(req);
      const result = UserValidation.validatePasswordReset(input);

      await userService.validatePasswordResetToken(
        result.token,
        // result.email,
        result.password,
        device_info
      );
      return {
        message: AuthTranslate[lang].auth.resetPassword.passwordResetSuccess,
      };
    },

    requestEmailChange: async (
      _parent: unknown,
      { email }: { email: string },
      { req }: Context
    ) => {
      await AuthMiddleware.requireAuth([])(req);

      //   if (!req.user?._id) {
      //     throw new AppError(AuthTranslate[lang].errors.userNotFound, 404);
      //   }
      const emailValid = UserValidation.isEmailValid(email);
      const device_info = await getDeviceFingerprint(req);
      await userService.requestEmailChange(
        req.user?._id.toString()!,
        emailValid,
        device_info
      );
      return {
        message: AuthTranslate[lang].auth.requestEmailChange.confirmation,
      };
    },
    confirmEmailChange: async (
      _parent: unknown,
      { token }: { token: string },
      { req }: Context
    ) => {
      await AuthMiddleware.requireAuth([])(req);
      const result = UserValidation.validateEmailAndToken({
        token,
        email: req.user?.email,
      });
      const device_info = await getDeviceFingerprint(req);
      await userService.confirmEmailChange(result.token, device_info);
      return {
        message: AuthTranslate[lang].auth.confirmEmailChange.emailChangeSuccess,
      };
    },
    verifyEmail: async (
      _parent: unknown,
      { code }: { code: string },
      { req }: Context
    ) => {
      await AuthMiddleware.requireAuthUnverified([])(req);

      const result = UserValidation.isVerificationCodeValid(code);
      const device_info = await getDeviceFingerprint(req);
      await userService.verifyEmail(
        req.user?._id.toString()!,
        result,
        device_info
      );
      return {
        message: AuthTranslate[lang].auth.verifyEmail.email_verified,
      };
    },
    sendNewVerificationCode: async (
      _parent: unknown,
      _args: unknown,
      { req }: Context
    ) => {
      await AuthMiddleware.requireAuthUnverified([])(req);
      const device_info = await getDeviceFingerprint(req);
      await userService.sendVerificationCode(
        req.user?._id.toString()!,
        device_info
      );
      return {
        message: AuthTranslate[lang].auth.sendNewVerificationCode.success,
      };
    },
    updateName: async (
      _parent: unknown,
      { name }: { name: string },
      { req }: Context
    ) => {
      await AuthMiddleware.requireAuth([])(req);
      const result = UserValidation.validateName(name);
      await userService.updateName(req.user?._id.toString()!, result);
      return {
        message: AuthTranslate[lang].auth.updateName.success,
      };
    },
    updateLoginNotificationSent: async (
      _parent: unknown,
      { login_notification_sent }: { login_notification_sent: boolean },
      { req }: Context
    ) => {
      await AuthMiddleware.requireAuth([])(req);
      const result = UserValidation.validateLoginNotificationSent(
        login_notification_sent
      );
      await userService.updateLoginNotificationSent(
        req.user?._id.toString()!,
        result
      );
      return {
        message: AuthTranslate[lang].auth.updateLoginNotificationSent.success,
      };
    },

    // Two-Factor Authentication mutations
    enable2FA: async (_parent: unknown, _args: unknown, { req }: Context) => {
      await AuthMiddleware.requireAuth([])(req);
      const userId = req.user?._id.toString()!;

      const result = await twoFactorService.initialize2FA(userId);
      return {
        qrCode: result.qrCode,
        manualEntryCode: result.manualEntryCode,
        backupCodes: result.backupCodes,
      };
    },

    verify2FA: async (
      _parent: unknown,
      { token }: { token: string },
      { req }: Context
    ) => {
      await AuthMiddleware.requireAuth([])(req);
      const userId = req.user?._id.toString()!;

      await twoFactorService.verify2FA(userId, token);
      return {
        message: "Two-factor authentication enabled successfully",
      };
    },

    disable2FA: async (_parent: unknown, _args: unknown, { req }: Context) => {
      await AuthMiddleware.requireAuth([])(req);
      const userId = req.user?._id.toString()!;

      await twoFactorService.disable2FA(userId);
      return {
        message: "Two-factor authentication disabled successfully",
      };
    },

    regenerateBackupCodes: async (
      _parent: unknown,
      _args: unknown,
      { req }: Context
    ) => {
      await AuthMiddleware.requireAuth([])(req);
      const userId = req.user?._id.toString()!;

      const newCodes = await twoFactorService.regenerateBackupCodes(userId);
      return {
        newCodes,
      };
    },
  },
};
