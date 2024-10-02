// @ts-ignore
import { Schema, model, models, Model, Document } from "mongoose";
import User, { IUserSchema } from "./user.model";

export interface IRefreshTokenSchema extends Document {
  _id: Schema.Types.ObjectId;

  token: string;
  user: IUserSchema["_id"];
  deviceInfo: string;
  ipAddress: string;
  expiresAt: Date;
  createdAt: Date;
  lastActiveAt: Date;
}
// const refreshTokenSchema = new Schema<IRefreshToken>({
const refreshTokenSchema = new Schema<IRefreshTokenSchema>({
  token: { type: String, required: true },
  user: {
    type: Schema.Types.ObjectId,

    ref: User, //"User",
    required: true,
  },
  deviceInfo: {
    type: String,
    required: true,
  }, // e.g., "iPhone 12, iOS 14.4"
  ipAddress: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
  lastActiveAt: { type: Date, default: Date.now }, // New field to track last activity
});

const RefreshToken: Model<IRefreshTokenSchema> =
  models.RefreshToken ||
  model<IRefreshTokenSchema>("RefreshToken", refreshTokenSchema);

export default RefreshToken;
