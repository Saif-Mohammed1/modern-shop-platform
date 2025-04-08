import {
  Schema,
  model,
  models,
  type Document,
  type Model,
  type Types,
} from "mongoose";

import type { DeviceInfo } from "@/app/lib/types/session.types";

export interface ISession extends Document {
  // _id: Schema.Types.ObjectId;
  userId: Types.ObjectId; // Reference to the User Model
  deviceInfo: DeviceInfo;
  hashedToken: string;
  isActive: boolean; // Track if session is valid or revoked
  revokedAt?: Date;
  expiresAt: Date; // Set session expiration date
  lastUsedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    deviceInfo: {
      os: { type: String, required: true },
      browser: { type: String, required: true },
      device: { type: String, required: true },
      brand: { type: String },
      model: { type: String },
      isBot: { type: Boolean, required: true },
      ip: { type: String, required: true },
      location: {
        city: { type: String, required: true },
        country: { type: String, required: true },
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
        source: { type: String, required: true },
      },
      fingerprint: { type: String, required: true },
    },
    hashedToken: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    revokedAt: Date,
    expiresAt: {
      type: Date,
      required: true,
      //   default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    }, // Default 30 days
    lastUsedAt: { type: Date, required: true, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (_, ret) {
        [
          "createdAt",
          "updatedAt",
          "expiresAt",
          "lastUsedAt",
          "revokedAt",
        ].forEach((field) => {
          if (ret[field]) {
            ret[field] = new Date(ret[field]).toISOString().split("T")[0];
          }
        });
        return ret;
      },
    },
  }
);

// Indexes for performance
SessionSchema.index({ userId: 1 });
// SessionSchema.index({ "deviceInfo.fingerprint": 1 }, { unique: true });
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
// ✅ Compound index for faster queries
SessionSchema.index({ userId: 1, hashedToken: 1, isActive: 1, expiresAt: 1 });
SessionSchema.set("toJSON", { versionKey: false });
const SessionModel: Model<ISession> =
  models.Session || model<ISession>("Session", SessionSchema);

export default SessionModel;
