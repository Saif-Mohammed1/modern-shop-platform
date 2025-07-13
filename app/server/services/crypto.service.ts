// src/app/lib/features/2fa/crypto.service.ts
import crypto from "crypto";

import { SECURITY_CONFIG } from "@/app/lib/config/security.config";
import type { EncryptedData } from "@/app/lib/types/2fa.db.types";

// import { SecurityMetadata } from "../models/2fa.model";

export class CryptoService {
  // createDeviceHash(metadata: SecurityMetadata): string {
  //   return crypto
  //     .createHash("sha256")
  //     .update(`${metadata.ipAddress}-${metadata.userAgent}`)
  //     .digest("hex");
  // }
  private bufferToUint8(buf: Buffer): Uint8Array {
    return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
  }
  encryptSecret(secret: string): EncryptedData {
    const algorithm = "aes-256-gcm";

    // Generate salt and convert to Uint8Array
    const salt = this.bufferToUint8(crypto.randomBytes(16));

    // Generate key using scryptSync
    const key = crypto.scryptSync(
      process.env.ENCRYPTION_KEY!,
      salt,
      SECURITY_CONFIG.AES_KEY_LENGTH
    );

    // Generate IV and convert to Uint8Array
    const ivBuffer = crypto.randomBytes(16);
    const iv = this.bufferToUint8(ivBuffer);

    // Create cipher with properly typed parameters
    const cipher = crypto.createCipheriv(
      algorithm,
      this.bufferToUint8(key), // Convert key to Uint8Array
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

  decryptSecret(encryptedData: EncryptedData): string {
    const algorithm = "aes-256-gcm";
    const key = crypto.scryptSync(
      process.env.ENCRYPTION_KEY!,
      this.bufferToUint8(Buffer.from(encryptedData.salt, "hex")),
      SECURITY_CONFIG.AES_KEY_LENGTH
    );

    const decipher = crypto.createDecipheriv(
      algorithm,
      this.bufferToUint8(key),
      this.bufferToUint8(Buffer.from(encryptedData.iv, "hex"))
    );
    decipher.setAuthTag(
      this.bufferToUint8(Buffer.from(encryptedData.authTag, "hex"))
    );

    let decrypted = decipher.update(encryptedData.content, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  }

  generateBackupCodes() {
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

  hashCode(code: string): string {
    const salt = crypto.randomBytes(16).toString("hex");
    return `${crypto
      .pbkdf2Sync(code, salt, SECURITY_CONFIG.PBKDF2_ITERATIONS, 64, "sha512")
      .toString("hex")}:${salt}`;
  }

  verifyBackupCode(code: string, hash: string): boolean {
    const [hashValue, salt] = hash.split(":");
    if (!salt) {
      return false;
    }
    return (
      crypto
        .pbkdf2Sync(code, salt, SECURITY_CONFIG.PBKDF2_ITERATIONS, 64, "sha512")
        .toString("hex") === hashValue
    );
  }
}
