import { Schema } from "mongoose";

export type UserAuthType = {
  _id: Schema.Types.ObjectId | string;
  name: string;
  email: string;
  emailVerify: boolean;
  role: string;
  createdAt: Date;
  phone?: string;
  isTwoFactorAuthEnabled: boolean;
  accessToken?: string;
  accessTokenExpires?: number;
};
