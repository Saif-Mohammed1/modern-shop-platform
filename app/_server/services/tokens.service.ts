import { sign } from "jsonwebtoken";
import crypto from "crypto";
import { IUser } from "../models/User.model";
export class TokensService {
  private RefreshExpiresAt = new Date(
    Date.now() +
      Number(process.env.JWT_REFRESH_TOKEN_COOKIE_EXPIRES_IN || 7) *
        24 *
        60 *
        60 *
        1000
  );
  COOKIE_NAME = "refreshAccessToken";

  generateAuthTokens(userId: IUser["_id"]): {
    accessToken: string;
    refreshToken: string;
    hashedToken: string;
  } {
    // Generate tokens
    const accessToken = this.createAccessToken(userId);
    const refreshToken = this.createRefreshToken(userId);

    // Hash and store refresh token
    const hashedToken = this.hashRefreshToken(refreshToken);

    return { accessToken, refreshToken, hashedToken };
  }

  private createAccessToken(userId: IUser["_id"]): string {
    return sign({ userId }, process.env.JWT_ACCESS_TOKEN_SECRET!, {
      expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN,
    });
  }

  private createRefreshToken(userId: IUser["_id"]): string {
    const refreshToken = sign(
      { userId },
      process.env.JWT_REFRESH_TOKEN_SECRET!,
      {
        expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN,
      }
    );
    return refreshToken;
  }
  hashRefreshToken = (token: string): string => {
    return crypto
      .createHmac("sha256", process.env.HASHED_REFRESH_TOKEN_SECRET!)
      .update(token)
      .digest("hex");
  };
  getRefreshTokenExpiry(): Date {
    return this.RefreshExpiresAt;
  }
  hashIpAddress(ip: string): string {
    return crypto
      .createHmac("sha256", process.env.HASHED_IP_ADDRESS_SECRET!)
      .update(ip)
      .digest("hex");
  }
  hashRestPasswordToken(token: string): string {
    return crypto
      .createHmac("sha256", process.env.HASHED_RESET_PASSWORD_SECRET!)
      .update(token)
      .digest("hex");
  }
  getResetPasswordTokenExpiry(): Date {
    return new Date(
      Date.now() +
        Number(process.env.HASHED_RESET_PASSWORD_SECRET_EXPIRES_IN || 10) *
          60 *
          1000
    );
  }
  hashVerificationToken(token: string): string {
    return crypto
      .createHmac("sha256", process.env.HASHED_VERIFICATION_SECRET!)
      .update(token)
      .digest("hex");
  }
  getVerificationTokenExpiry(): Date {
    return new Date(
      Date.now() +
        Number(process.env.HASHED_VERIFICATION_SECRET_EXPIRES_IN || 10) *
          60 *
          1000
    );
  }
  generateEmailChangeToken(userId: IUser["_id"], email: string): string {
    const token = crypto.randomBytes(32).toString("hex");
    const hashedToken = this.hashVerificationToken(token);
    return hashedToken;
  }
  //   getAccessTokenExpiry(): Date {
  //     return process.env.JWT_ACCESS_TOKEN_EXPIRES_IN;
  //   }
}
