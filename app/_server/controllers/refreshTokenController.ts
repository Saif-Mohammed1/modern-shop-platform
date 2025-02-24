import { DeviceInfo, RefreshTokenStatus } from "@/app/lib/types/session.types";
import {
  getDeviceFingerprint,
  hashRefreshToken,
} from "@/app/lib/utilities/refresh-token.util";
import RefreshToken, { IRefreshToken } from "../models/Session.model";
import { sign, verify } from "jsonwebtoken";
import { type NextRequest } from "next/server";

import { cookies } from "next/headers";
import { refreshTokenControllerTranslate } from "../../../public/locales/server/refreshTokenControllerTranslate";
import { lang } from "@/app/lib/utilities/lang";
import AppError from "@/app/lib/utilities/appError";

export class RefreshTokenService {
  private static expiresAt = new Date(
    Date.now() +
      Number(process.env.JWT_REFRESH_TOKEN_COOKIE_EXPIRES_IN) *
        24 *
        60 *
        60 *
        1000
  );
  private static COOKIE_NAME = "refreshAccessToken";

  static async generateTokens(userId: string, req: NextRequest) {
    // Generate tokens
    const accessToken = this.createAccessToken(userId);
    const refreshToken = this.createRefreshToken(userId);

    // Hash and store refresh token
    const hashedToken = hashRefreshToken(refreshToken);
    await this.storeRefreshToken(userId, hashedToken, req);

    return { accessToken, refreshToken };
  }

  private static createAccessToken(userId: string) {
    return sign({ userId }, process.env.JWT_ACCESS_TOKEN_SECRET!, {
      expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN,
    });
  }

  private static createRefreshToken(userId: string) {
    const refreshToken = sign(
      { userId },
      process.env.JWT_REFRESH_TOKEN_SECRET!,
      {
        expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN,
      }
    );
    this.setRefreshTokenCookie(refreshToken);
    return refreshToken;
  }

  private static async storeRefreshToken(
    userId: string,
    hashedToken: string,
    req: NextRequest
  ) {
    const deviceInfo = await getDeviceFingerprint(req);
    await RefreshToken.create({
      tokenHash: hashedToken,
      user: userId,
      deviceInfo,
      expiresAt: this.expiresAt,
    });
  }

  static setRefreshTokenCookie(token: string) {
    cookies().set(this.COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax", // 'Lax' in development if set none need secure to true
      secure: process.env.NODE_ENV === "production", // 'false' in development
      path: "/",
      expires: this.expiresAt,
      // Add these for enhanced security:
      partitioned: true, // Chrome 109+ feature
      priority: "high", // Protect against CRIME attacks
    });
  }

  static async refreshAccessToken(req: NextRequest) {
    const refreshToken =
      cookies()?.get("refreshAccessToken")?.value ||
      req?.cookies?.get("refreshAccessToken")?.value;

    if (!refreshToken)
      throw new AppError(
        refreshTokenControllerTranslate[
          lang
        ].functions.refreshAccessToken.requiredFields,
        401
      );

    // Verify token signature
    const decoded = verify(
      refreshToken,
      process.env.JWT_REFRESH_TOKEN_SECRET!
    ) as { userId: string };

    // Check database validity
    const isValid = await this.validateRefreshToken(
      decoded.userId,
      refreshToken
    );
    if (!isValid) {
      throw new AppError(
        refreshTokenControllerTranslate[
          lang
        ].functions.verifyRefreshToken.invalidRefreshToken,
        401
      );
    }

    // // Rotate tokens
    // await this.rotateRefreshToken(refreshToken, decoded.userId);

    // Return new access token
    const accessToken = this.createAccessToken(decoded.userId);
    return { accessToken, statusCode: 200 };
  }

  // static async logoutUser(req: NextRequest) {
  //   // Clear cookie
  //   cookies().delete(this.COOKIE_NAME);

  //   // Revoke all tokens
  //   await this.revokeAllUserTokens(req);
  // }

  static async revokeToken(req: NextRequest): Promise<{
    message: string;
    statusCode: number;
  }> {
    const refreshToken =
      cookies()?.get("refreshAccessToken")?.value ||
      req?.cookies?.get("refreshAccessToken")?.value;
    if (!refreshToken)
      throw new AppError(
        refreshTokenControllerTranslate[
          lang
        ].functions.verifyRefreshToken.invalidRefreshToken,
        401
      );
    const tokenHash = hashRefreshToken(refreshToken);
    await RefreshToken.updateOne(
      { tokenHash, user: req.user?._id },
      { $set: { status: RefreshTokenStatus.Revoked } }
    );
    return {
      message:
        refreshTokenControllerTranslate[lang].functions.revokeToken.message,
      statusCode: 200,
    };
  }

  static async revokeAllUserTokens(
    req: NextRequest
  ): Promise<{ message: string; statusCode: number }> {
    await RefreshToken.updateMany(
      { user: req.user?._id },
      { $set: { status: RefreshTokenStatus.Revoked } }
    );

    return {
      message:
        refreshTokenControllerTranslate[lang].functions.revokeAllUserTokens
          .message,
      statusCode: 200,
    };
  }

  static async getActiveSessions(req: NextRequest): Promise<{
    info: IRefreshToken[];
    statusCode: number;
  }> {
    const info = await RefreshToken.find({
      user: req.user?._id,
      status: RefreshTokenStatus.Active,
      expiresAt: { $gt: new Date() },
    }).sort({ lastUsedAt: -1 });

    return {
      info,
      statusCode: 200,
    };
  }

  static async rotateRefreshToken(
    oldTokenHash: string,
    newRawToken: string,
    req: NextRequest
  ): Promise<IRefreshToken> {
    const session = await RefreshToken.startSession();
    session.startTransaction();

    try {
      // Revoke old token
      const [deviceInfo, _] = await Promise.all([
        getDeviceFingerprint(req),
        RefreshToken.updateOne(
          { tokenHash: oldTokenHash },
          { $set: { status: RefreshTokenStatus.Rotated } },
          { session }
        ),
      ]);

      // Create new token
      const newToken = await RefreshToken.create(
        [
          {
            tokenHash: hashRefreshToken(newRawToken),
            user: (await RefreshToken.findOne({ tokenHash: oldTokenHash }))
              ?.user,
            "deviceInfo.fingerprint": deviceInfo.fingerprint,
            expiresAt: this.expiresAt,
          },
        ],
        { session }
      );

      await session.commitTransaction();
      return newToken[0];
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  static async validateRefreshToken(
    userId: string,
    rawToken: string
  ): Promise<boolean> {
    const tokenHash = hashRefreshToken(rawToken);
    const token = await RefreshToken.findActiveToken(userId, tokenHash);

    if (!token) return false;

    // Update last used timestamp
    await RefreshToken.updateOne(
      { _id: token._id },
      { $set: { lastUsedAt: new Date() } }
    );

    return true;
  }
  static async isFirstLoginFromDevice(
    req: NextRequest,
    deviceInfo: DeviceInfo
  ): Promise<boolean> {
    return !(await RefreshToken.exists({
      user: req.user?._id,
      "deviceInfo.fingerprint": deviceInfo.fingerprint,
      status: RefreshTokenStatus.Active,
    }));
  }
}
