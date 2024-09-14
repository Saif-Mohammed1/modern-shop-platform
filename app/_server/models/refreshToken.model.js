import { Schema, model, models } from "mongoose";
import User from "./user.model";
const refreshTokenSchema = new Schema({
  token: { type: String, required: true },
  user: {
    type: Schema.ObjectId,
    ref: "User",
    required: true,
  },
  deviceInfo: { type: String, required: true }, // e.g., "iPhone 12, iOS 14.4"
  ipAddress: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  lastActiveAt: { type: Date, default: Date.now }, // New field to track last activity
});

const RefreshToken =
  models.RefreshToken || model("RefreshToken", refreshTokenSchema);

export default RefreshToken;
