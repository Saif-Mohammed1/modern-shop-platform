import { AuthMiddleware } from "../../middlewares/auth.middleware";
import { TwoFactorService } from "../../services/2fa.service";
import type { Context } from "../apollo-server";

const twoFactorService: TwoFactorService = new TwoFactorService();

interface Verify2FAInput {
  token: string;
  tempToken?: string;
}

interface Disable2FAInput {
  code: string;
}

interface VerifyBackupCodeInput {
  code: string;
}

interface ValidateBackupCodesInput {
  codes: string[];
  email: string;
}

export const twoFAResolvers = {
  Query: {
    getTwoFactorStatus: async (
      _parent: unknown,
      _args: unknown,
      { req }: Context
    ) => {
      await AuthMiddleware.requireAuth([])(req);
      const { user } = req;

      return {
        enabled: user?.two_factor_enabled || false,
        backupCodesCount: 0, // This would need to be implemented in the service
        lastUsed: null, // This would need to be implemented in the service
      };
    },

    getTwoFactorAuditLogs: async (
      _parent: unknown,
      _args: unknown,
      { req }: Context
    ) => {
      await AuthMiddleware.requireAuth([])(req);
      const userId = req.user?._id.toString()!;

      const logs = await twoFactorService.getAuditLogs(userId);
      return logs;
    },
  },

  Mutation: {
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
      { input }: { input: Verify2FAInput },
      { req }: Context
    ) => {
      if (input.tempToken) {
        // Handle 2FA login verification (matches PUT /api/v1/auth/2fa/verify)
        await twoFactorService.verifyLogin2FA(input.tempToken, input.token);
        return {
          message: "Two-factor authentication verified successfully",
        };
      }

      // Handle regular 2FA verification during setup (matches POST /api/v1/auth/2fa/verify)
      await AuthMiddleware.requireAuth([])(req);
      const userId = req.user?._id.toString()!;

      await twoFactorService.verify2FA(userId, input.token);
      return {
        message: "Two-factor authentication verified successfully",
      };
    },

    disable2FA: async (
      _parent: unknown,
      { input: _input }: { input: Disable2FAInput },
      { req }: Context
    ) => {
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

    verifyBackupCode: async (
      _parent: unknown,
      { input }: { input: VerifyBackupCodeInput },
      { req }: Context
    ) => {
      await AuthMiddleware.requireAuth([])(req);
      const userId = req.user?._id.toString()!;

      await twoFactorService.verifyBackupCode(userId, input.code);
      return {
        message: "Backup code verified successfully",
      };
    },

    validateBackupCodes: async (
      _parent: unknown,
      { input }: { input: ValidateBackupCodesInput }
    ) => {
      // This doesn't require auth as it's used during account recovery
      const deviceInfo = {
        os: "unknown",
        browser: "unknown",
        device: "unknown",
        is_bot: false,
        ip: "unknown",
        location: {
          city: "unknown",
          country: "unknown",
          latitude: 0,
          longitude: 0,
          source: "ip" as const,
        },
        fingerprint: "unknown",
      };

      const result = await twoFactorService.validateBackupCodes(
        input.email,
        input.codes,
        deviceInfo
      );
      return result;
    },

    verify2FALogin: async (
      _parent: unknown,
      { token, tempToken }: { token: string; tempToken: string }
    ) => {
      const result = await twoFactorService.verifyLogin2FA(tempToken, token);
      return result;
    },
  },
};
