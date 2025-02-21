import { sign } from "jsonwebtoken";
import crypto from "crypto";
import { promisify } from "util";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
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

  generateAuthTokens(userId: string): {
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

  createAccessToken(userId: string): string {
    return sign({ userId }, process.env.JWT_ACCESS_TOKEN_SECRET!, {
      expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN,
    });
  }

  async decodedAccessToken(accessToken: string): Promise<{ userId: string }> {
    return (await promisify<string, jwt.Secret>(jwt.verify)(
      accessToken,
      process.env.JWT_ACCESS_TOKEN_SECRET!
    )) as unknown as { userId: string };
  }

  private createRefreshToken(userId: string): string {
    const refreshToken = sign(
      { userId },
      process.env.JWT_REFRESH_TOKEN_SECRET!,
      {
        expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN,
      }
    );
    return refreshToken;
  }
  async decodedRefreshToken(refreshToken: string): Promise<{ userId: string }> {
    return (await promisify<string, jwt.Secret>(jwt.verify)(
      refreshToken,
      process.env.JWT_REFRESH_TOKEN_SECRET!
    )) as unknown as { userId: string };
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
  generateEmailChangeToken(userId: string, email: string): string {
    const token = crypto.randomBytes(32).toString("hex");
    const hashedToken = this.hashVerificationToken(token);
    return hashedToken;
  }
  //   getAccessTokenExpiry(): Date {
  //     return process.env.JWT_ACCESS_TOKEN_EXPIRES_IN;
  //   }

  clearRefreshTokenCookies() {
    cookies().set(this.COOKIE_NAME, "", {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      secure: process.env.NODE_ENV === "production",
      expires: new Date(0),
      path: "/",
      priority: "high",
      partitioned: true,
    });
  }
  setRefreshTokenCookies(token: string) {
    cookies().set(this.COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax", // 'Lax' in development if set none need secure to true
      secure: process.env.NODE_ENV === "production", // 'false' in development
      path: "/",
      expires: this.getRefreshTokenExpiry(),
      // Add these for enhanced security:
      partitioned: true, // Chrome 109+ feature
      priority: "high", // Protect against CRIME attacks
    });
  }
}
