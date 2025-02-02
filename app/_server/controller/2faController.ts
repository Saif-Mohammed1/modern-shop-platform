import AppError from "@/components/util/appError";
import TwoFactorAuth, {
  AuditLog,
  EncryptedData,
  ITwoFactorAuth,
  SecurityMetadata,
} from "../models/2fa.model";
import type { NextRequest } from "next/server";
import * as crypto from "crypto";
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import { v4 as uuidv4 } from "uuid";
import { IUserSchema } from "../models/user.model";

// Configuration Constants
const SECURITY_CONFIG = {
  BACKUP_CODES: 10,
  PBKDF2_ITERATIONS: 10000,
  AES_KEY_LENGTH: 32,
  TOTP_WINDOW: 1,
  MAX_ATTEMPTS: 5,
  LOCKOUT_MINUTES: 15,
  SESSION_DAYS: 30,
};

// Helper function to safely convert Buffer to Uint8Array
function bufferToUint8(buf: Buffer): Uint8Array {
  return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
}

class CryptoService {
  static encryptSecret(secret: string): EncryptedData {
    const algorithm = "aes-256-gcm";

    // Generate salt and convert to Uint8Array
    const salt = bufferToUint8(crypto.randomBytes(16));

    // Generate key using scryptSync
    const key = crypto.scryptSync(
      process.env.ENCRYPTION_KEY!,
      salt,
      SECURITY_CONFIG.AES_KEY_LENGTH
    );

    // Generate IV and convert to Uint8Array
    const ivBuffer = crypto.randomBytes(16);
    const iv = bufferToUint8(ivBuffer);

    // Create cipher with properly typed parameters
    const cipher = crypto.createCipheriv(
      algorithm,
      bufferToUint8(key), // Convert key to Uint8Array
      iv
    );

    let encrypted = cipher.update(secret, "utf8", "hex");
    encrypted += cipher.final("hex");

    return {
      iv: ivBuffer.toString("hex"), // Return original Buffer for hex conversion
      salt: Buffer.from(salt).toString("hex"),
      content: encrypted,
      authTag: cipher.getAuthTag().toString("hex"),
    };
  }

  static decryptSecret(encryptedData: EncryptedData): string {
    const algorithm = "aes-256-gcm";
    const key = crypto.scryptSync(
      process.env.ENCRYPTION_KEY!,
      bufferToUint8(Buffer.from(encryptedData.salt, "hex")),
      SECURITY_CONFIG.AES_KEY_LENGTH
    );

    const decipher = crypto.createDecipheriv(
      algorithm,
      bufferToUint8(key),
      bufferToUint8(Buffer.from(encryptedData.iv, "hex"))
    );
    decipher.setAuthTag(
      bufferToUint8(Buffer.from(encryptedData.authTag, "hex"))
    );

    let decrypted = decipher.update(encryptedData.content, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  }

  static generateBackupCodes() {
    const codes: string[] = [];
    for (let i = 0; i < SECURITY_CONFIG.BACKUP_CODES; i++) {
      codes.push(
        crypto
          .randomBytes(10)
          .toString("base64")
          .replace(/[^a-zA-Z0-9]/g, "")
          .slice(0, 16)
          .match(/.{4}/g)!
          .join("-")
      );
    }
    return codes;
  }

  static hashCode(code: string): string {
    const salt = crypto.randomBytes(16).toString("hex");
    return (
      crypto
        .pbkdf2Sync(code, salt, SECURITY_CONFIG.PBKDF2_ITERATIONS, 64, "sha512")
        .toString("hex") + `:${salt}`
    );
  }

  static verifyBackupCode(code: string, hash: string): boolean {
    const [hashValue, salt] = hash.split(":");
    if (!salt) return false;
    return (
      crypto
        .pbkdf2Sync(code, salt, SECURITY_CONFIG.PBKDF2_ITERATIONS, 64, "sha512")
        .toString("hex") === hashValue
    );
  }
}

// Main 2FA Service
export class TwoFactorAuthService {
  static async initialize2FA(req: NextRequest) {
    try {
      const user = req.user;
      if (!user) {
        throw new AppError("User not found", 404);
      }
      const metadata = collectSecurityMetadata(req);
      if (user.isTwoFactorAuthEnabled) {
        throw new AppError("2FA already enabled", 400);
      }

      const secret = speakeasy.generateSecret({
        name: `${process.env.APP_NAME}:${user.email}`,
        length: 40,
      });

      const encryptedSecret = CryptoService.encryptSecret(secret.base32);
      const backupCodes = CryptoService.generateBackupCodes();
      const qrCode = await qrcode.toDataURL(secret.otpauth_url!);

      await TwoFactorAuth.create({
        userId: user._id,
        encryptedSecret,
        backupCodes: backupCodes.map(CryptoService.hashCode),
        recoveryAttempts: 0,
        auditLogs: [this.createAuditEntry("2FA_INIT", metadata)],
      });

      return {
        qrCode,
        backupCodes,
        manualEntryCode: secret.base32,
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }

  static async verify2FA(req: NextRequest) {
    let twoFA;
    const metadata = collectSecurityMetadata(req);

    try {
      if (!req.user) throw new AppError("User not found", 404);

      twoFA = await TwoFactorAuth.findOne({ userId: req.user._id });
      if (!twoFA) throw new AppError("2FA not configured", 404);
      const { token } = await req.json();
      if (!token) throw new AppError("Verification code is required", 400);

      this.checkLockoutStatus(twoFA);

      const secret = CryptoService.decryptSecret(twoFA.encryptedSecret);
      const verified = speakeasy.totp.verify({
        secret,
        encoding: "base32",
        token,
        window: SECURITY_CONFIG.TOTP_WINDOW,
        time: Date.now() / 1000,
      });

      if (!verified) {
        await this.handleFailedAttempt(twoFA, metadata);

        throw new AppError("Invalid verification code", 401);
      }

      await this.handleSuccessfulVerification(req.user, twoFA, metadata);
      // return this.generateSessionToken(req.user);
      return {
        // token: this.generateSessionToken(),
        message: "2FA verification successful",
        statusCode: 200,
      };
    } catch (error) {
      if (twoFA) await this.handleFailedAttempt(twoFA, metadata);
      throw error;
    }
  }

  static async verifyBackupCode(req: NextRequest) {
    const user = req.user;
    if (!user) throw new AppError("User not found", 404);
    const metadata = collectSecurityMetadata(req);
    const { code } = await req.json();
    if (!code) throw new AppError("Backup code is required", 400);
    const twoFA = await TwoFactorAuth.findOne({ userId: user._id }).select(
      "+backupCodes"
    );
    if (!twoFA) throw new AppError("2FA not configured", 404);

    this.checkLockoutStatus(twoFA);

    const sanitizedCode = code.replace(/-/g, "");
    const validCodeIndex = twoFA.backupCodes.findIndex((hash) =>
      CryptoService.verifyBackupCode(sanitizedCode, hash)
    );

    if (validCodeIndex === -1) {
      await this.handleFailedAttempt(twoFA, metadata);
      throw new AppError("Invalid backup code", 401);
    }

    await this.handleValidBackupCode(user, twoFA, validCodeIndex, metadata);
    // return this.generateSessionToken();
    return {
      // token: this.generateSessionToken(),
      message: "Backup code verification successful",
      // remainingCodes: twoFA.backupCodes.length - 1, // After removal
      statusCode: 200,
    };
  }

  static async disable2FA(user: IUserSchema, metadata: SecurityMetadata) {
    const result = await TwoFactorAuth.findOneAndDelete({ userId: user._id });
    if (!result) throw new AppError("2FA not enabled", 400);

    user.isTwoFactorAuthEnabled = false;
    await user.save();

    const auditEntry = this.createAuditEntry("2FA_DISABLED", metadata);
    result.auditLogs.push(auditEntry);
    return { success: true };
  }

  // Helper Methods
  private static checkLockoutStatus(twoFA: ITwoFactorAuth) {
    if (
      twoFA.recoveryAttempts >= SECURITY_CONFIG.MAX_ATTEMPTS &&
      twoFA.lastUsed &&
      Date.now() - twoFA.lastUsed.getTime() <
        SECURITY_CONFIG.LOCKOUT_MINUTES * 60 * 1000
    ) {
      throw new AppError(
        `Account locked. Try again after ${SECURITY_CONFIG.LOCKOUT_MINUTES} minutes`,
        429
      );
    }
  }

  private static async handleFailedAttempt(
    twoFA: ITwoFactorAuth,
    metadata: SecurityMetadata
  ) {
    twoFA.recoveryAttempts += 1;
    twoFA.lastUsed = new Date();
    twoFA.auditLogs.push(this.createAuditEntry("2FA_FAILED_ATTEMPT", metadata));
    await TwoFactorAuth.updateOne({ _id: twoFA._id }, twoFA);
  }

  private static async handleSuccessfulVerification(
    user: IUserSchema,
    twoFA: ITwoFactorAuth,
    metadata: SecurityMetadata
  ) {
    user.isTwoFactorAuthEnabled = true;
    twoFA.recoveryAttempts = 0;
    twoFA.lastUsed = undefined;
    twoFA.auditLogs.push(this.createAuditEntry("2FA_SUCCESS", metadata));

    await Promise.all([user.save(), twoFA.save()]);
  }

  private static async handleValidBackupCode(
    user: IUserSchema,
    twoFA: ITwoFactorAuth,
    codeIndex: number,
    metadata: SecurityMetadata
  ) {
    twoFA.backupCodes.splice(codeIndex, 1);
    twoFA.recoveryAttempts = Math.max(0, twoFA.recoveryAttempts - 1);
    twoFA.auditLogs.push(this.createAuditEntry("BACKUP_CODE_USED", metadata));

    if (twoFA.backupCodes.length < 3) {
      twoFA.auditLogs.push(
        this.createAuditEntry("BACKUP_CODE_LOW_WARNING", metadata)
      );
    }

    await Promise.all([twoFA.save(), user.save()]);
  }

  private static generateSessionToken() {
    const sessionToken = uuidv4();
    const expires = new Date(
      Date.now() + SECURITY_CONFIG.SESSION_DAYS * 86400000
    );

    return {
      token: sessionToken,
      expires,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
    };
  }

  private static createAuditEntry(
    action: string,
    metadata: SecurityMetadata
  ): AuditLog {
    return {
      timestamp: new Date(),
      action,
      metadata: {
        ...metadata,
        deviceHash: this.createDeviceHash(metadata),
      },
    };
  }

  private static createDeviceHash(metadata: SecurityMetadata): string {
    return crypto
      .createHash("sha256")
      .update(`${metadata.ipAddress}-${metadata.userAgent}`)
      .digest("hex");
  }
}

// Middleware for Security Metadata
export function collectSecurityMetadata(req: NextRequest): SecurityMetadata {
  return {
    ipAddress:
      req.headers.get("x-client-ip") ||
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.ip ||
      "unknown",
    userAgent: req.headers.get("user-agent") || "unknown",
    deviceHash: "",
    location: req.headers.get("x-location") || "unknown",
  };
}
