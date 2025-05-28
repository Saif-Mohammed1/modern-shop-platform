// src/app/lib/features/2fa/2fa.service.ts
import type { Knex } from "knex";
import qrcode from "qrcode";
import speakeasy from "speakeasy";

import { SECURITY_CONFIG } from "@/app/lib/config/security.config";
import logger from "@/app/lib/logger/logs";
import type {
  EncryptedData,
  ITwoFactorAuthAuditLogDB,
  ITwoFactorAuthDB,
} from "@/app/lib/types/2fa.db.types";
import { SecurityAuditAction } from "@/app/lib/types/audit.db.types";
import type { DeviceInfo } from "@/app/lib/types/session.types";
import AppError from "@/app/lib/utilities/appError";
import { generateUUID } from "@/app/lib/utilities/id";
import { lang } from "@/app/lib/utilities/lang";
import { TwoFactorTranslate } from "@/public/locales/server/TwoFactor.Translate";

import { connectDB } from "../db/db";
import { TwoFactorRepository } from "../repositories/2fa.repository";

import { CryptoService } from "./crypto.service";
import { SessionService } from "./session.service";
import { UserService } from "./user.service";

import { emailService } from ".";

export class TwoFactorService {
  constructor(
    private readonly repository: TwoFactorRepository = new TwoFactorRepository(
      connectDB()
    ),
    private readonly userService: UserService = new UserService(),
    private readonly cryptoService: CryptoService = new CryptoService(),
    private readonly sessionService: SessionService = new SessionService()
  ) {
    this.repository = repository;
    this.userService = userService;
    this.cryptoService = cryptoService;
    this.sessionService = sessionService;
  }

  async initialize2FA(user_id: string) {
    const existing2FA = await this.repository.findByUserId(user_id);
    if (existing2FA) {
      throw new AppError(
        TwoFactorTranslate[lang].error.alreadyInitialized,
        400
      );
    }

    const secret = speakeasy.generateSecret({
      name: `${process.env.APP_NAME}:${user_id}`,
      length: 40,
    });

    const encryptedSecret = this.cryptoService.encryptSecret(secret.base32);
    const backupCodes = this.cryptoService.generateBackupCodes();
    await this.repository.create({
      user_id: user_id,
      encrypted_iv: encryptedSecret.iv,
      encrypted_auth_tag: encryptedSecret.authTag,
      encrypted_content: encryptedSecret.content,
      encrypted_salt: encryptedSecret.salt,
      recovery_attempts: 0,
      last_used: new Date(),
      // backupCodes: backupCodes.map(this.cryptoService.hashCode),
      // auditLogs: [this.createAuditLog("2FA_INIT", metadata)],
    });
    await this.repository.saveBackupCodes(
      backupCodes.map(this.cryptoService.hashCode),
      user_id
    );
    const qrCode = await qrcode.toDataURL(secret.otpauth_url!);
    return {
      qrCode,
      backupCodes,
      manualEntryCode: secret.base32,
      twoFAId: user_id,
    };
  }

  async verify2FA(user_id: string, token: string) {
    const twoFA = await this.repository.findByUserId(user_id);
    if (!twoFA) {
      throw new AppError(
        TwoFactorTranslate[lang].error.notConfigured,

        404
      );
    }

    this.checkLockoutStatus(twoFA);

    const secret = this.cryptoService.decryptSecret(
      this.convertToEncryptedData(twoFA)
    );
    const verified = speakeasy.totp.verify({
      secret,
      encoding: "base32",
      token,
      window: SECURITY_CONFIG.TOTP_WINDOW,
    });

    if (!verified) {
      await this.handleFailedAttempt(user_id);
      throw new AppError(
        TwoFactorTranslate[lang].error.invalidVerificationCode,
        401
      );
    }
    await this.repository.transaction(async (trx) => {
      await this.handleSuccessfulVerification(user_id, trx);
    });
    return { success: true };
  }

  async verifyBackupCode(user_id: string, code: string) {
    const twoFA = await this.repository.findByUserId(user_id);
    if (!twoFA) {
      throw new AppError(TwoFactorTranslate[lang].error.notConfigured, 404);
    }

    this.checkLockoutStatus(twoFA);
    const backupCodes = await this.repository.getBackupCodes(user_id);
    if (!backupCodes) {
      throw new AppError(TwoFactorTranslate[lang].error.notConfigured, 400);
    }
    const validCode = backupCodes.find((hash) =>
      this.cryptoService.verifyBackupCode(code, hash.code)
    );

    if (!validCode) {
      await this.handleFailedAttempt(user_id);
      throw new AppError(TwoFactorTranslate[lang].error.invalidBackupCode, 401);
    }
    if (validCode.is_used) {
      await this.handleFailedAttempt(user_id);
      throw new AppError(
        TwoFactorTranslate[lang].error.backupCodeAlreadyUsed,
        401
      );
    }

    await this.repository.transaction(async (trx) => {
      await Promise.all([
        this.repository.updateBackupCodeStatus(
          validCode._id,
          { is_used: true },
          trx
        ),
        this.repository.addAuditLog(
          user_id,
          this.createAuditLog("BACKUP_CODE_USED"),
          trx
        ),
      ]);
      const remainingCodes =
        backupCodes.filter((code) => !code.is_used).length - 1; // Subtract the just-used code
      if (remainingCodes < 3) {
        await this.repository.addAuditLog(
          user_id,
          this.createAuditLog("BACKUP_CODE_LOW_WARNING"),
          trx
        );
      }
    });
    const remainingCodes =
      backupCodes.filter((code) => !code.is_used).length - 1; // Subtract the just-used code

    return { remainingCodes: remainingCodes };
  }

  async disable2FA(user_id: string) {
    const twoFA = await this.repository.disableTwoFactorAuth(user_id);
    // await  this.repository.findByUserId(user_id);

    if (!twoFA) {
      throw new AppError(TwoFactorTranslate[lang].error.notConfigured, 400);
    }

    // await
    //   this.repository.deleteTwoFactorAuth(user_id),

    await this.repository.addAuditLog(
      user_id,
      this.createAuditLog("2FA_DISABLED")
    );

    return { success: true };
  }

  async regenerateBackupCodes(user_id: string) {
    const newCodes = this.cryptoService.generateBackupCodes();

    await this.repository.transaction(async (trx) => {
      await this.repository.regenerateBackupCodes(
        newCodes.map(this.cryptoService.hashCode),
        user_id,
        trx
      );
      // await this.repository.resetRecoveryAttempts(user_id, trx);
      await this.repository.addAuditLog(
        user_id,
        this.createAuditLog("BACKUP_CODE_REGENERATED"),
        trx
      );
    });

    return { newCodes };
  }

  async getAuditLogs(user_id: string) {
    return await this.repository.getAuditLogs(user_id);
    // const twoFA = await this.repository.findOne(
    //   { user_id },
    //   { select: "auditLogs" }
    // );
    // return twoFA?.auditLogs.reverse().slice(0, 10) || [];
  }

  async validateBackupCodes(
    email: string,
    codes: string[],
    device_info: DeviceInfo
  ) {
    const user = await this.userService.findUserByEmail(email);
    if (!user) {
      logger.warn(`Backup code attempt for non-existent user: ${email}`);
      throw new AppError(TwoFactorTranslate[lang].error.notFoundUser, 404);
    }
    await this.userService.checkRateLimit(user, "backup_recovery");
    // Validate input codes for uniqueness
    const uniqueCodes = new Set(codes);
    if (uniqueCodes.size !== codes.length || codes.length !== 5) {
      await this.userService.incrementRateLimit(user, "backup_recovery");
      throw new AppError(TwoFactorTranslate[lang].error.invalidBackupCode, 400);
    }
    // Check rate limit before any processing

    const backupCodes = await this.repository.getBackupCodes(user._id);

    if (!backupCodes || backupCodes.length < 5) {
      logger.warn(`Backup code attempt without proper 2FA setup: ${user._id}`);
      await this.userService.incrementRateLimit(user, "backup_recovery");
      throw new AppError(TwoFactorTranslate[lang].error.notConfigured, 400);
    }

    const matchedIndices: string[] = [];
    const usedCodes: string[] = [];
    // Atomic transaction
    try {
      // Process all codes before failing to prevent timing attacks
      for (const [_index, code] of codes.entries()) {
        const validCode = backupCodes.find((hash) =>
          this.cryptoService.verifyBackupCode(code, hash.code)
        );

        if (!validCode) {
          logger.warn(`Invalid backup code attempt for user: ${user._id}`);
          continue;
        }
        if (validCode.is_used) {
          logger.warn(`Backup code already used: ${user._id}`);
          continue;
        }
        if (matchedIndices.some((matched) => matched === validCode._id)) {
          logger.warn(`Duplicate backup code used: ${user._id}`);
          continue;
        }

        matchedIndices.push(validCode._id);
        usedCodes.push(code);
      }

      // Verify all 5 codes matched
      if (matchedIndices.length !== 5 || new Set(matchedIndices).size !== 5) {
        await this.userService.incrementRateLimit(user, "backup_recovery");
        throw new AppError(
          TwoFactorTranslate[lang].error.invalidBackupCode,
          400
        );
      }

      // const updatedCodes = backupCodes.filter(
      //   (code) => !matchedIndices.includes(code._id)
      // );
      const updates = matchedIndices.map((id) => ({
        _id: id,
        is_used: true,
      }));
      // if (updatedCodes.length !== backupCodes.length - 5) {
      //   throw new AppError(
      //     TwoFactorTranslate[lang].error.validationFailed,
      //     400
      //   );
      // }
      await this.repository.transaction(async (trx) => {
        await Promise.all([
          this.repository.updateBackupCodes(user._id.toString(), updates, trx),

          // Audit log

          this.userService.createAuditLog(
            user._id.toString(),
            SecurityAuditAction.BACKUP_CODE_RECOVERY,
            {
              success: true,
              message: TwoFactorTranslate[lang].success.backupCodeRecovery,
              // codesUsed: usedCodes,
              // remainingCodes: updatedCodes.length,
              device: device_info,
            },
            trx
          ),
        ]);
      });

      // Security recommendations
      if (backupCodes.length - 5 < 3) {
        await emailService.sendSecurityAlertEmail(user.email, {
          type: SecurityAuditAction.LOW_BACKUP_CODES,

          additionalInfo: {
            remainingCodes: backupCodes.length - 5,
            attempts: 5,
          },
          timestamp: new Date(),
          ipAddress: device_info.ip,
          device: device_info,
          location: `${device_info.location.city}, ${device_info.location.country}`,
        });
      }
      // Force password reset and session cleanup

      await this.sessionService.revokeAllSessions(user._id.toString());
      await this.userService.requestPasswordReset(user.email, device_info);
      return {
        success: true,
        remainingCodes: backupCodes.length - 5,
        resetRequired: true,
      };
    } catch (error) {
      await this.userService.createAuditLog(
        user._id.toString(),
        SecurityAuditAction.BACKUP_CODE_RECOVERY,
        {
          success: false,
          message: (error as Error)?.message || "undefined",
          device: device_info,
        }
      );

      throw error;
    }
  }

  private async handleFailedAttempt(user_id: string) {
    await Promise.all([
      this.repository.incrementRecoveryAttempts(user_id),
      this.repository.addAuditLog(
        user_id,
        this.createAuditLog("2FA_FAILED_ATTEMPT")
      ),
    ]);
  }
  async verifyLogin2FA(tempToken: string, code: string) {
    const user = await this.userService.validateTempToken(tempToken);

    const twoFA = await this.repository.findByUserId(user._id);

    if (!twoFA) {
      throw new AppError(TwoFactorTranslate[lang].error.notConfigured, 400);
    }

    // try {
    // Try TOTP verification first
    await this.verify2FA(user._id.toString(), code);
    return user;
    // } catch (totpError) {
    //   // Fallback to backup code verification
    //   return await this.verifyBackupCode(user._id.toString(), code, metadata);
    // }
  }
  private async handleSuccessfulVerification(
    user_id: string,
    trx: Knex.Transaction
  ) {
    await Promise.all([
      this.userService.enable2FA(user_id, trx),
      this.repository.resetRecoveryAttempts(user_id, trx),
      this.repository.addAuditLog(
        user_id,
        this.createAuditLog("2FA_SUCCESS"),
        trx
      ),
    ]);
  }

  private checkLockoutStatus(twoFA: ITwoFactorAuthDB) {
    if (
      twoFA.recovery_attempts &&
      twoFA.recovery_attempts >= SECURITY_CONFIG.MAX_ATTEMPTS &&
      twoFA.last_used &&
      Date.now() - twoFA.last_used.getTime() <
        SECURITY_CONFIG.LOCKOUT_MINUTES * 60 * 1000
    ) {
      throw new AppError(
        TwoFactorTranslate[lang].locked(
          String(SECURITY_CONFIG.LOCKOUT_MINUTES)
        ),
        429
      );
    }
  }

  private createAuditLog(
    action: string
  ): Omit<ITwoFactorAuthAuditLogDB, "two_factor_auth_id"> {
    return {
      _id: generateUUID(),

      timestamp: new Date(),
      action,
      // metadata: {
      //   ...metadata,
      //   deviceHash: this.cryptoService.createDeviceHash(metadata),
      // },
    };
  }
  private convertToEncryptedData(twoFA: ITwoFactorAuthDB): EncryptedData {
    return {
      iv: twoFA.encrypted_iv,
      salt: twoFA.encrypted_salt,
      content: twoFA.encrypted_content,
      authTag: twoFA.encrypted_auth_tag,
    };
  }
}
