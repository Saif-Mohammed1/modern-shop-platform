import AppError from "@/app/lib/utilities/appError";
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
import User, { IUserSchema } from "../models/user.model";
import { cookies } from "next/headers";
import { modifyFinalResponse } from "./authController";
import { authControllerTranslate } from "../../../public/locales/server/authControllerTranslate";
import { lang } from "@/app/lib/utilities/lang";
import { sendMessageForNewPassword } from "@/app/lib/utilities/email";
import { RefreshTokenService } from "./refreshTokenController";

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
    let token;
    try {
      if (!req.user) throw new AppError("User not found", 404);

      twoFA = await TwoFactorAuth.findOne({ userId: req.user._id });
      if (!twoFA) throw new AppError("2FA not configured", 404);

      if (req?.token) {
        token = req.token;
      } else {
        token = await req.json();
      }
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
      throw error;
    }
  }
  static async verify2FAOnLogin(req: NextRequest) {
    try {
      const tempToken =
        cookies().get("tempToken")?.value ||
        req.cookies.get("tempToken")?.value; // Get temporary token from cookies;
      if (!tempToken) throw new AppError("Temporary token not found", 400);
      const { code } = await req.json();
      if (!code) throw new AppError("Verification code is required", 400);
      //  check code if its 6 digit
      if (!/^\d{6}$/.test(code))
        throw new AppError("Invalid verification code", 400);
      const user = await User.findOne({
        twoFactorTempToken: tempToken,
        twoFactorTempTokenExpires: { $gt: new Date() },
      });

      if (!user) throw new AppError("Invalid or expired token", 400);
      await this.rateLimitUser(user);

      req.user = user;
      req.token = code;
      // Your 2FA validation logic here
      // const isValid = await this.verify2FA(req);
      await this.verify2FA(req);

      // if (!isValid) {
      //   throw new AppError("Invalid verification code", 400);
      // }

      // Clear temporary token after successful verification
      await User.updateOne(
        { _id: user._id },
        {
          $unset: {
            twoFactorTempToken: 1,
            twoFactorTempTokenExpires: 1,
          },
        }
      );

      // Proceed with final login
      const { accessToken } = await RefreshTokenService.generateTokens(
        String(user._id),
        req
      );
      return modifyFinalResponse({ ...user.toObject(), accessToken }, 200);
    } catch (error) {
      throw error;
    }
  }
  static async verifyBackupCode(req: NextRequest) {
    const user = req.user;
    try {
      if (!user) throw new AppError("User not found", 404);
      const metadata = collectSecurityMetadata(req);
      const { code } = await req.json();
      if (!code) throw new AppError("Backup code is required", 400);
      const twoFA = await TwoFactorAuth.findOne({ userId: user._id }).select(
        "+backupCodes"
      );
      if (!twoFA) throw new AppError("2FA not configured", 404);

      this.checkLockoutStatus(twoFA);

      const sanitizedCode = code.trim();
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
    } catch (error) {
      throw error;
    }
  }

  static async disable2FA(req: NextRequest) {
    const user = req.user;
    try {
      if (!user) throw new AppError("User not found", 404);
      const metadata = collectSecurityMetadata(req);
      const result = await TwoFactorAuth.findOneAndDelete({ userId: user._id });
      if (!result) throw new AppError("2FA not enabled", 400);

      user.isTwoFactorAuthEnabled = false;
      await user.save();

      const auditEntry = this.createAuditEntry("2FA_DISABLED", metadata);
      result.auditLogs.push(auditEntry);
      return { message: "2FA disabled", statusCode: 200 };
    } catch (error) {
      throw error;
    }
  }
  // In TwoFactorAuthService
  static async reGenerateBackupCodes(req: NextRequest) {
    const user = req.user;
    try {
      if (!user) throw new AppError("User not found", 404);
      const newCodes = CryptoService.generateBackupCodes();
      const twoFA = await TwoFactorAuth.findOneAndUpdate(
        { userId: user._id },
        {
          $set: {
            backupCodes: newCodes.map(CryptoService.hashCode),
            recoveryAttempts: 0,
          },
        },
        { new: true }
      );
      return { newCodes, statusCode: 200 };
    } catch (error) {
      throw error;
    }
  }
  // static async validateBackupCode(req: NextRequest) {
  //   // in this fun yuser at leat must provide 5 code buckup ['skd-dsdsd', 'sdsd-sdsd', 'sdsd-sdsd', 'sdsd-sdsd', 'sdsd-sdsd']
  //   try {
  //     const { codes, email } = await req.json();

  //     // Validate email
  //     if (!email) throw new AppError("Email is required", 400);

  //     // Validate backup codes
  //     if (!Array.isArray(codes) || codes.length === 0) {
  //       throw new AppError("At least one backup code is required", 400);
  //     }

  //     // Fetch user
  //     const user = await User.findOne({ email: email.toLowerCase() });
  //     if (!user) throw new AppError("User not found", 404);

  //     // Fetch 2FA settings
  //     const twoFA = await TwoFactorAuth.findOne({ userId: user._id }).select(
  //       "+backupCodes"
  //     );
  //     if (
  //       !twoFA ||
  //       !Array.isArray(twoFA.backupCodes) ||
  //       twoFA.backupCodes.length === 0
  //     ) {
  //       throw new AppError(
  //         "2FA is not configured or backup codes are missing",
  //         404
  //       );
  //     }

  //     // Sanitize codes (remove hyphens) and verify them
  //     const sanitizedCodes = codes.map((code) => code.replace(/-/g, ""));

  //     const validCodeIndex = sanitizedCodes.findIndex((sanitizedCode) =>
  //       twoFA.backupCodes.some((hash) =>
  //         CryptoService.verifyBackupCode(sanitizedCode, hash)
  //       )
  //     );

  //     if (validCodeIndex === -1) {
  //       throw new AppError("Invalid backup code", 401);
  //     }

  //     // Generate a secure random password
  //     const newPassword = crypto.randomBytes(16).toString("hex");
  //     user.password = newPassword;
  //     await user.save();

  //     // Send email with the new password
  //     await sendMessageForNewPassword(user, newPassword);

  //     return {
  //       message:
  //         "Validation successful! Please check your email for the new password.",
  //       statusCode: 200,
  //     };
  //   } catch (error) {
  //     throw error;
  //   }
  // }
  static async validateBackupCode(req: NextRequest) {
    try {
      const { codes, email } = await req.json();

      // Validate input
      if (!email) throw new AppError("Email is required", 400);
      if (!Array.isArray(codes) || codes.length !== 5) {
        throw new AppError("Exactly 5 backup codes are required", 400);
      }

      // Sanitize and check for request duplicates
      const sanitizedCodes = codes.map((c) => c.trim());
      if (new Set(sanitizedCodes).size !== 5) {
        throw new AppError("Duplicate codes in request", 400);
      }

      // Fetch user and 2FA data
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) throw new AppError("User not found", 404);
      await this.rateLimitUser(user);

      const twoFA = await TwoFactorAuth.findOne({ userId: user._id })
        .select("+backupCodes")
        .lean();
      if (!twoFA?.backupCodes?.length) {
        throw new AppError("2FA backup codes not configured", 404);
      }

      // Track matched backup code indices
      const matchedIndices: number[] = [];
      for (const code of sanitizedCodes) {
        let matchedIndex = -1;
        for (let i = 0; i < twoFA.backupCodes.length; i++) {
          if (CryptoService.verifyBackupCode(code, twoFA.backupCodes[i])) {
            if (matchedIndices.includes(i)) {
              throw new AppError("Duplicate backup codes detected", 400);
            }
            matchedIndex = i;
            break;
          }
        }
        if (matchedIndex === -1) {
          throw new AppError(`Invalid backup code: ${code}`, 400);
        }
        matchedIndices.push(matchedIndex);
      }

      // Verify all 5 codes matched unique backups
      if (new Set(matchedIndices).size !== 5) {
        throw new AppError("Invalid backup codes", 400);
      }

      // Remove used backup codes
      const updatedBackupCodes = twoFA.backupCodes.filter(
        (_, index) => !matchedIndices.includes(index)
      );

      const updatedTwoFA = await TwoFactorAuth.findByIdAndUpdate(
        twoFA._id,
        { $set: { backupCodes: updatedBackupCodes } },
        { new: true }
      );

      if (
        !updatedTwoFA ||
        updatedTwoFA.backupCodes.length !== twoFA.backupCodes.length - 5
      ) {
        throw new AppError("Failed to update backup codes", 500);
      }

      // Reset password
      const newPassword = crypto.randomBytes(16).toString("hex");
      user.password = newPassword;
      user.passwordLoginAttempts = 0;
      await user.save();

      await sendMessageForNewPassword(user, newPassword);

      return {
        message: "Password reset successful. Check your email.",
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }
  static async getAuditLogs(req: NextRequest) {
    const user = req.user;
    try {
      if (!user) throw new AppError("User not found", 404);
      const twoFA = await TwoFactorAuth.findOne({ userId: user._id })
        .select("auditLogs")
        .lean();
      return { logs: twoFA?.auditLogs || [], statusCode: 200 };
    } catch (error) {
      throw error;
    }
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
    // twoFA.recoveryAttempts += 1;
    // twoFA.lastUsed = new Date();
    // twoFA.auditLogs.push(this.createAuditEntry("2FA_FAILED_ATTEMPT", metadata));
    // await TwoFactorAuth.updateOne({ _id: twoFA._id }, twoFA);
    const auditEntry = this.createAuditEntry("2FA_FAILED_ATTEMPT", metadata);
    await TwoFactorAuth.updateOne(
      { _id: twoFA._id },
      {
        $inc: { recoveryAttempts: 1 },
        $set: { lastUsed: new Date() },
        $push: { auditLogs: auditEntry },
      }
    );
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

  static async generateSessionToken(req: NextRequest) {
    try {
      const { email } = await req.json();
      if (!email) throw new AppError("Email is required", 400);
      const user = await User.findOne({
        email,
      });
      if (!user) throw new AppError("User not found", 404);
      const now = new Date();

      if (user.twoFactorTempToken && user.twoFactorTempTokenExpires > now) {
        return {
          user: {
            message: "Temporary token generated",
            tempToken: user.twoFactorTempToken,
            tempTokenExpires: user.twoFactorTempTokenExpires,
          },
          statusCode: 200,
        };
      }
      await this.rateLimitUser(user);
      // Generate new token only if none exists or expired
      const tempToken = crypto.randomBytes(32).toString("hex");
      const tempTokenExpires = new Date(now.getTime() + 300000); // 5 minutes
      const expires = new Date(
        Date.now() + 5 * 60 * 1000 // 5 minutes * 60 seconds * 1000 milliseconds
      );

      cookies().set("tempToken", tempToken, {
        path: "/", // Ensure the cookie is available across all routes
        expires,

        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax", // 'Lax' in development if set none need secure to true
        secure: process.env.NODE_ENV === "production", // 'false' in development
        // domain: process.env.NODE_ENV === "production" ? undefined : undefined, // No domain in localhost
        // secure: req?.secure || req?.headers["x-forwarded-proto"] === "https",
      });
      await User.updateOne(
        { _id: user._id },
        {
          twoFactorTempToken: tempToken,
          twoFactorTempTokenExpires: tempTokenExpires,
        }
      );
      return {
        message: "Temporary token generated",
        tempToken,
        tempTokenExpires,
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
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
  private static async rateLimitUser(user: IUserSchema) {
    try {
      if (user.passwordLoginBlockedUntil) {
        if (user.passwordLoginBlockedUntil < new Date()) {
          // user.passwordLoginBlockedUntil = undefined;
          await User.updateOne(
            { _id: user._id },
            {
              $unset: {
                passwordLoginBlockedUntil: 1,
                twoFactorTempToken: 1,
                twoFactorTempTokenExpires: 1,
              },
            }
          );
          // await user.save();
        } else {
          throw new AppError(
            authControllerTranslate[
              lang
            ].functions.logIn.logInAttemptsBlockedMessage,
            400
          );
        }
      }
      user.passwordLoginAttempts = (user.passwordLoginAttempts || 0) + 1;

      // Block the user after 4 unsuccessful attempts
      if (user.passwordLoginAttempts >= 4) {
        user.passwordLoginAttempts = undefined;

        user.passwordLoginBlockedUntil = new Date(Date.now() + 3600000); // 1 hour in milliseconds
      }
      await user.save();

      if (user.passwordLoginAttempts && user.passwordLoginAttempts >= 4) {
        throw new AppError(
          authControllerTranslate[
            lang
          ].functions.logIn.tooManyUnsuccessfulPasswordAttemptsMessage,
          400
        );
      }
    } catch (error) {
      throw error;
    }
  }
  static test() {
    const backupCodes = CryptoService.generateBackupCodes();
    // return { backupCodes, statusCode: 200 };
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
