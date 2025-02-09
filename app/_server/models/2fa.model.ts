import { Document, Model, model, models, Schema } from "mongoose";
// Enhanced Type Definitions
export interface SecurityMetadata {
  ipAddress: string;
  userAgent: string;
  location?: string;
  deviceHash: string;
}
export interface AuditLog {
  timestamp: Date;
  action: string;
  metadata: SecurityMetadata;
}

export interface EncryptedData {
  iv: string;
  salt: string;
  content: string;
  authTag: string;
}

// Improved 2FA Schema
export interface ITwoFactorAuth extends Document {
  userId: Schema.Types.ObjectId;
  _id: Schema.Types.ObjectId;
  encryptedSecret: EncryptedData;
  backupCodes: string[]; // Hashed codes
  recoveryAttempts: number;
  lastUsed?: Date;
  auditLogs: AuditLog[];

  createdAt: Date;
  updatedAt: Date;
}

const TwoFactorAuthSchema: Schema = new Schema<ITwoFactorAuth>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
      unique: true,
      index: true,
    },
    encryptedSecret: {
      iv: String,
      salt: String,
      content: String,
      authTag: String,
    },
    backupCodes: [
      {
        type: String,
        select: false,
      },
    ],
    recoveryAttempts: {
      type: Number,
      default: 0,
    },
    lastUsed: Date,
    auditLogs: [
      {
        timestamp: Date,
        action: String,
        metadata: {
          ipAddress: String,
          userAgent: String,
          location: String,
          deviceHash: String,
        },
      },
    ],
  },
  { timestamps: true }
);
const TwoFactorAuth: Model<ITwoFactorAuth> =
  models.TwoFactorAuth ||
  model<ITwoFactorAuth>("TwoFactorAuth", TwoFactorAuthSchema);
export default TwoFactorAuth;
