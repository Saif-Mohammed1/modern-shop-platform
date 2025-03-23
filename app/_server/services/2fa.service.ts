// src/app/lib/features/2fa/2fa.service.ts
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import { SECURITY_CONFIG } from "@/app/lib/config/security.config";
import { TwoFactorRepository } from "../repositories/2fa.repository";
import { UserService } from "./user.service";
import { CryptoService } from "./crypto.service";
import AppError from "@/app/lib/utilities/appError";
import TwoFactorAuthModel, {
  AuditLog,
  ITwoFactorAuth,
  SecurityMetadata,
} from "../models/2fa.model";
import { assignAsObjectId } from "@/app/lib/utilities/assignAsObjectId";
import { TwoFactorTranslate } from "@/public/locales/server/TwoFactor.Translate";
import { lang } from "@/app/lib/utilities/lang";
import logger from "@/app/lib/logger/logs";
import { SessionService } from "./session.service";
import { DeviceInfo } from "@/app/lib/types/session.types";
import { SecurityAuditAction } from "@/app/lib/types/audit.types";
import {
  emailService,
  SecurityAlertType,
} from "@/app/lib/services/email.service";

export class TwoFactorService {
  constructor(
    private readonly repository: TwoFactorRepository = new TwoFactorRepository(
      TwoFactorAuthModel
    ),
    private readonly userService: UserService = new UserService(),
    private readonly cryptoService: CryptoService = new CryptoService(),
    private readonly sessionService: SessionService = new SessionService()
  ) {}

  async initialize2FA(userId: string, metadata: SecurityMetadata) {
    const existing2FA = await this.repository.findOne({ userId });
    if (existing2FA)
      throw new AppError(
        TwoFactorTranslate[lang].error.alreadyInitialized,
        400
      );

    const secret = speakeasy.generateSecret({
      name: `${process.env.APP_NAME}:${userId}`,
      length: 40,
    });

    const encryptedSecret = this.cryptoService.encryptSecret(secret.base32);
    const backupCodes = this.cryptoService.generateBackupCodes();

    const twoFA = await this.repository.create({
      userId: assignAsObjectId(userId),
      encryptedSecret,
      backupCodes: backupCodes.map(this.cryptoService.hashCode),
      auditLogs: [this.createAuditLog("2FA_INIT", metadata)],
    });

    const qrCode = await qrcode.toDataURL(secret.otpauth_url!);
    return {
      qrCode,
      backupCodes,
      manualEntryCode: secret.base32,
      twoFAId: twoFA._id,
    };
  }

  async verify2FA(userId: string, token: string, metadata: SecurityMetadata) {
    const twoFA = await this.repository.findOne({ userId });
    if (!twoFA)
      throw new AppError(
        TwoFactorTranslate[lang].error.notConfigured,

        404
      );

    this.checkLockoutStatus(twoFA);

    const secret = this.cryptoService.decryptSecret(twoFA.encryptedSecret);
    const verified = speakeasy.totp.verify({
      secret,
      encoding: "base32",
      token,
      window: SECURITY_CONFIG.TOTP_WINDOW,
    });

    if (!verified) {
      await this.handleFailedAttempt(userId, metadata);
      throw new AppError(
        TwoFactorTranslate[lang].error.invalidVerificationCode,
        401
      );
    }

    await this.handleSuccessfulVerification(userId, metadata);
    return { success: true };
  }

  async verifyBackupCode(
    userId: string,
    code: string,
    metadata: SecurityMetadata
  ) {
    const twoFA = await this.repository.findOne({ userId });
    if (!twoFA)
      throw new AppError(TwoFactorTranslate[lang].error.notConfigured, 404);

    this.checkLockoutStatus(twoFA);

    const validCodeIndex = twoFA.backupCodes.findIndex((hash) =>
      this.cryptoService.verifyBackupCode(code, hash)
    );

    if (validCodeIndex === -1) {
      await this.handleFailedAttempt(userId, metadata);
      throw new AppError(TwoFactorTranslate[lang].error.invalidBackupCode, 401);
    }

    const updatedCodes = twoFA.backupCodes.filter(
      (_, index) => index !== validCodeIndex
    );
    await this.repository.updateBackupCodes(userId, updatedCodes);
    await this.repository.addAuditLog(
      userId,
      this.createAuditLog("BACKUP_CODE_USED", metadata)
    );

    if (updatedCodes.length < 3) {
      await this.repository.addAuditLog(
        userId,
        this.createAuditLog("BACKUP_CODE_LOW_WARNING", metadata)
      );
    }

    return { remainingCodes: updatedCodes.length };
  }

  async disable2FA(userId: string, metadata: SecurityMetadata) {
    const [user, twoFA] = await Promise.all([
      this.userService.findUserById(userId),
      this.repository.findOne({ userId }),
    ]);

    if (!twoFA)
      throw new AppError(TwoFactorTranslate[lang].error.notConfigured, 400);

    await Promise.all([
      this.userService.disable2FA(userId),
      this.repository.deleteTwoFactor(userId),
    ]);

    await this.repository.addAuditLog(
      userId,
      this.createAuditLog("2FA_DISABLED", metadata)
    );

    return { success: true };
  }

  async regenerateBackupCodes(userId: string, metadata: SecurityMetadata) {
    const newCodes = this.cryptoService.generateBackupCodes();
    await this.repository.updateBackupCodes(
      userId,
      newCodes.map(this.cryptoService.hashCode)
    );
    await this.repository.resetRecoveryAttempts(userId);
    await this.repository.addAuditLog(
      userId,
      this.createAuditLog("BACKUP_CODE_REGENERATED", metadata)
    );

    return { newCodes };
  }

  async getAuditLogs(userId: string) {
    const twoFA = await this.repository.findOne(
      { userId },
      { select: "auditLogs" }
    );
    return twoFA?.auditLogs.reverse().slice(0, 10) || [];
  }

  async validateBackupCodes(
    email: string,
    codes: string[],
    deviceInfo: DeviceInfo
  ) {
    const user = await this.userService.findUserByEmail(email);
    if (!user) {
      logger.warn(`Backup code attempt for non-existent user: ${email}`);
      throw new AppError(TwoFactorTranslate[lang].error.notFoundUser, 404);
    }

    // Check rate limit before any processing
    user.checkRateLimit("backup_recovery");

    const twoFA = await this.repository.findOne(
      { userId: user._id },
      { select: "+backupCodes" }
    );

    if (!twoFA || twoFA.backupCodes.length < 5) {
      logger.warn(`Backup code attempt without proper 2FA setup: ${user.id}`);
      await this.userService.incrementRateLimit(user, "backup_recovery");
      throw new AppError(TwoFactorTranslate[lang].error.notConfigured, 400);
    }

    const matchedIndices: number[] = [];
    const usedCodes: string[] = [];
    // Atomic transaction
    const session = await this.repository.startSession();
    session.startTransaction();
    try {
      // Process all codes before failing to prevent timing attacks
      for (const [index, code] of codes.entries()) {
        const codeIndex = twoFA.backupCodes.findIndex((hash) =>
          this.cryptoService.verifyBackupCode(code, hash)
        );

        if (codeIndex === -1) {
          logger.warn(`Invalid backup code attempt for user: ${user._id}`);
          continue;
        }

        if (matchedIndices.includes(codeIndex)) {
          logger.warn(`Duplicate backup code used: ${user._id}`);
          continue;
        }

        matchedIndices.push(codeIndex);
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

      const updatedCodes = twoFA.backupCodes.filter(
        (_, index) => !matchedIndices.includes(index)
      );

      if (updatedCodes.length !== twoFA.backupCodes.length - 5) {
        await session.abortTransaction();
        throw new AppError(
          TwoFactorTranslate[lang].error.validationFailed,
          400
        );
      }

      await this.repository.updateBackupCodes(
        user._id.toString(),
        updatedCodes,
        session
      );

      // Audit log

      await this.userService.createAuditLog(
        user._id.toString(),
        SecurityAuditAction.BACKUP_CODE_RECOVERY,
        {
          success: true,
          codesUsed: usedCodes,
          remainingCodes: updatedCodes.length,
        },
        session
      );

      // Security recommendations
      if (twoFA.backupCodes.length - 5 < 3) {
        await emailService.sendSecurityAlertEmail(user.email, {
          type: SecurityAlertType.LOW_BACKUP_CODES,

          additionalInfo: {
            remainingCodes: updatedCodes.length,
            attempts: twoFA.backupCodes.length - 5,
          },
          timestamp: new Date(),
          ipAddress: deviceInfo.ip,
          device: {
            browser: deviceInfo.browser,
            os: deviceInfo.os,
            model: deviceInfo.model,
          },
          location: `${deviceInfo.location.city}, ${deviceInfo.location.country}`,
        });
      }
      // Force password reset and session cleanup

      await this.sessionService.revokeAllSessions(user._id.toString());
      await this.userService.requestPasswordReset(user.email, deviceInfo);
      await session.commitTransaction();
      return {
        success: true,
        remainingCodes: twoFA.backupCodes.length - 5,
        resetRequired: true,
      };
    } catch (error) {
      await this.userService.createAuditLog(
        user._id.toString(),
        SecurityAuditAction.BACKUP_CODE_RECOVERY,
        {
          success: false,
          error: (error as any).message,
        }
      );

      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
  //   async validateBackupCodes(email: string, codes: string[]) {
  //     const user = await this.userService.findUserByEmail(email);
  //     if (!user)
  //       throw new AppError(TwoFactorTranslate[lang].error.notFoundUser, 404);

  //     const twoFA = await this.repository.findOne(
  //       { userId: user._id },
  //       {
  //         select: "+backupCodes",
  //       }
  //     );
  //     if (!twoFA)
  //       throw new AppError(TwoFactorTranslate[lang].error.notConfigured, 400);
  //     user.checkRateLimit("2fa");

  //     console.log("twoFA", twoFA);
  //     const matchedIndices: number[] = [];
  //     for (const code of codes) {
  //       const index = twoFA.backupCodes.findIndex((hash) =>
  //         this.cryptoService.verifyBackupCode(code, hash)
  //       );
  //       if (index === -1) {
  //         await this.userService.incrementRateLimit(user, "2fa");
  //         throw new AppError(
  //           TwoFactorTranslate[lang].error.invalidBackupCode,
  //           400
  //         );
  //       }
  //       if (matchedIndices.includes(index)) {
  //         await this.userService.incrementRateLimit(user, "2fa");
  //         throw new AppError(TwoFactorTranslate[lang].error.duplicateCode, 400);
  //       }
  //       matchedIndices.push(index);
  //     }

  //     const updatedCodes = twoFA.backupCodes.filter(
  //       (_, index) => !matchedIndices.includes(index)
  //     );

  //     await this.repository.updateBackupCodes(
  //       String(user._id),

  //       updatedCodes
  //     );
  //     return { success: true };
  //   }

  private async handleFailedAttempt(
    userId: string,
    metadata: SecurityMetadata
  ) {
    await Promise.all([
      this.repository.incrementRecoveryAttempts(userId),
      this.repository.addAuditLog(
        userId,
        this.createAuditLog("2FA_FAILED_ATTEMPT", metadata)
      ),
    ]);
  }
  async verifyLogin2FA(
    tempToken: string,
    code: string,
    metadata: SecurityMetadata
  ) {
    const user = await this.userService.validateTempToken(tempToken);
    const twoFA = await this.repository.findOne({
      userId: user._id.toString(),
    });

    if (!twoFA) {
      throw new AppError(TwoFactorTranslate[lang].error.notConfigured, 400);
    }

    // try {
    // Try TOTP verification first
    await this.verify2FA(user._id.toString(), code, metadata);
    return user;
    // } catch (totpError) {
    //   // Fallback to backup code verification
    //   return await this.verifyBackupCode(user._id.toString(), code, metadata);
    // }
  }
  private async handleSuccessfulVerification(
    userId: string,
    metadata: SecurityMetadata
  ) {
    await Promise.all([
      this.userService.enable2FA(userId),
      this.repository.resetRecoveryAttempts(userId),
      this.repository.addAuditLog(
        userId,
        this.createAuditLog("2FA_SUCCESS", metadata)
      ),
    ]);
  }

  private checkLockoutStatus(twoFA: ITwoFactorAuth) {
    if (
      twoFA.recoveryAttempts >= SECURITY_CONFIG.MAX_ATTEMPTS &&
      twoFA.lastUsed &&
      Date.now() - twoFA.lastUsed.getTime() <
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

  private createAuditLog(action: string, metadata: SecurityMetadata): AuditLog {
    return {
      timestamp: new Date(),
      action,
      metadata: {
        ...metadata,
        deviceHash: this.cryptoService.createDeviceHash(metadata),
      },
    };
  }
}
