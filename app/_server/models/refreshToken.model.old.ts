// @ts-ignore
import { Schema, model, models, Model, Document } from "mongoose";
import User, { IUser } from "./User.model";

export interface IRefreshTokenSchema extends Document {
  _id: Schema.Types.ObjectId;

  token: string;
  user: IUser["_id"];
  deviceInfo: string;
  ipAddress: string;
  expiresAt: Date;
  lastActiveAt: Date;
  // createdAt: Date;
  // updatedAt: Date;
}
// const refreshTokenSchema = new Schema<IRefreshToken>({
const refreshTokenSchema = new Schema<IRefreshTokenSchema>(
  {
    token: { type: String, required: true },
    user: {
      type: Schema.Types.ObjectId,

      ref: "User",
      required: true,
      index: true,
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
    lastActiveAt: { type: Date, default: Date.now }, // New field to track last activity
  },
  {
    timestamps: true,
  }
);

const RefreshToken: Model<IRefreshTokenSchema> =
  models.RefreshToken ||
  model<IRefreshTokenSchema>("RefreshToken", refreshTokenSchema);

export default RefreshToken;

/** 
// refresh-token.model.ts
import { Schema, model, models, Model, Document } from "mongoose";
import User, { IUser } from "./User.model";
import { DeviceInfo, RefreshTokenStatus } from "@/app/lib/types/refresh.types";

export interface IRefreshToken extends Document {
  _id: Schema.Types.ObjectId;
  tokenHash: string;
  user: IUser["_id"];
  deviceInfo: DeviceInfo;
  status: RefreshTokenStatus;
  expiresAt: Date;
  lastUsedAt: Date;
  // createdAt: Date;
  // updatedAt: Date;
  loginNotificationSent: boolean;
}

// Static methods interface
interface IRefreshTokenModel extends Model<IRefreshToken> {
  findActiveToken: (
    userId: string,
    tokenHash: string
  ) => Promise<IRefreshToken | null>;
}

const refreshTokenSchema = new Schema<IRefreshToken, IRefreshTokenModel>(
  {
    tokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    deviceInfo: {
      type: {
        os: { type: String, required: true },
        browser: { type: String, required: true },
        device: { type: String, required: true },
        brand: { type: String },
        model: { type: String },
        isBot: { type: Boolean, required: true },
        ip: { type: String, required: true },
        location: { type: String },
        fingerprint: { type: String, required: true, index: true },
      },
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(RefreshTokenStatus),
      default: RefreshTokenStatus.Active,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    lastUsedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    loginNotificationSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    statics: {
      async findActiveToken(userId: string, tokenHash: string) {
        return this.findOne({
          user: userId,
          tokenHash,
          status: RefreshTokenStatus.Active,
          expiresAt: { $gt: new Date() },
        }).lean();
      },
    },
    toJSON: {
      transform: function (_doc, ret) {
        ret._id = ret._id.toString();
        delete ret.__v;
      },
    },
  }
);

// ✅ TTL index for automatic expiration cleanup
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// ✅ Compound index for faster queries
refreshTokenSchema.index({ user: 1, tokenHash: 1, status: 1, expiresAt: 1 });

const RefreshToken: IRefreshTokenModel =
  (models.RefreshToken as unknown as IRefreshTokenModel) ||
  model<IRefreshToken, IRefreshTokenModel>("RefreshToken", refreshTokenSchema);

export default RefreshToken;

/**
 * // In your authentication controller
const handleRefreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    const userId = getUserIdFromToken(refreshToken);

    // Validate token
    const isValid = await RefreshTokenService.validateRefreshToken(userId, refreshToken);
    if (!isValid) throw new AuthenticationError('Invalid refresh token');

    // Rotate tokens
    const newRefreshToken = generateSecureRefreshToken(userId);
    const rotatedToken = await RefreshTokenService.rotateRefreshToken(
      hashRefreshToken(refreshToken),
      newRefreshToken,
      req
    );

    // Issue new access token
    const accessToken = generateAccessToken(userId);

    return res.json({
      accessToken,
      refreshToken: newRefreshToken
    });
    
  } catch (error) {
    handleAuthError(error, res);
  }
};
 */
