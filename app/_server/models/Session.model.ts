import { DeviceInfo } from "@/app/lib/types/refresh.types";
import { Schema, model, models, Document, Model } from "mongoose";
import { IUser } from "./User.model";

export interface ISession extends Document {
  userId: IUser["_id"]; // Reference to the User Model
  deviceInfo: DeviceInfo;
  hashedToken: string;
  isActive: boolean; // Track if session is valid or revoked
  revokedAt?: Date;
  expiresAt: Date; // Set session expiration date
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
      location: { type: String },
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
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
SessionSchema.index({ userId: 1 });
// SessionSchema.index({ "deviceInfo.fingerprint": 1 }, { unique: true });
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const SessionModel: Model<ISession> =
  models.Session || model<ISession>("Session", SessionSchema);

export default SessionModel;
