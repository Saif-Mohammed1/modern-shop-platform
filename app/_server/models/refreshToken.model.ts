import { Schema, model, models, Model, Document } from "mongoose";
import User, { IUserSchema } from "./user.model";
import { refreshTokenControllerTranslate } from "../_Translate/refreshTokenControllerTranslate";
import { lang } from "@/components/util/lang";
interface IRefreshTokenSchema extends Document {
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

    ref: "User",
    required: [
      true,
      refreshTokenControllerTranslate[lang].model.schema.user.required,
    ],
  },
  deviceInfo: {
    type: String,
    required: [
      true,
      refreshTokenControllerTranslate[lang].model.schema.deviceInfo.required,
    ],
  }, // e.g., "iPhone 12, iOS 14.4"
  ipAddress: {
    type: String,
    required: [
      true,
      refreshTokenControllerTranslate[lang].model.schema.ipAddress.required,
    ],
  },
  expiresAt: {
    type: Date,
    required: [
      true,
      refreshTokenControllerTranslate[lang].model.schema.expiresAt.required,
    ],
  },
  createdAt: { type: Date, default: Date.now },
  lastActiveAt: { type: Date, default: Date.now }, // New field to track last activity
});

const RefreshToken: Model<IRefreshTokenSchema> =
  models.RefreshToken ||
  model<IRefreshTokenSchema>("RefreshToken", refreshTokenSchema);

export default RefreshToken;
