import { sign } from "jsonwebtoken";
import crypto from "crypto";
import { promisify } from "util";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
export class TokensService {
  private readonly COOKIE_NAME;
  private readonly RefreshExpiresAt;
  constructor() {
    this.RefreshExpiresAt = new Date(
      Date.now() +
        Number(process.env.JWT_REFRESH_TOKEN_COOKIE_EXPIRES_IN || 7) *
          24 *
          60 *
          60 *
          1000
    );
    this.COOKIE_NAME = "refreshAccessToken";
  }
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

  // createAccessToken(userId: string): string {
  //   return sign({ userId }, process.env.JWT_ACCESS_TOKEN_SECRET!, {
  //     expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN,
  //   });
  // }

  createAccessToken(userId: string): string {
    return sign(
      { userId },
      process.env.JWT_ACCESS_TOKEN_SECRET as jwt.Secret, // 1. Type assertion for secret
      {
        expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN as string | number, // 2. Type assertion for expiresIn
      } as jwt.SignOptions // 3. Explicit type casting
    );
  }
  async decodedAccessToken(accessToken: string): Promise<{ userId: string }> {
    return (await promisify<string, jwt.Secret>(jwt.verify)(
      accessToken,
      process.env.JWT_ACCESS_TOKEN_SECRET!
    )) as unknown as { userId: string };
  }

  // private createRefreshToken(userId: string): string {
  //   const refreshToken = sign(
  //     { userId },
  //     process.env.JWT_REFRESH_TOKEN_SECRET!,
  //     {
  //       expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN,
  //     }
  //   );
  //   return refreshToken;
  // }
  private createRefreshToken(userId: string): string {
    const refreshToken = sign(
      { userId },
      process.env.JWT_REFRESH_TOKEN_SECRET as jwt.Secret, // 1. Type assertion for secret
      {
        expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN as string | number, // 2. Type assertion for expiresIn
      } as jwt.SignOptions // 3. Explicit type casting
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
  hashEmailChangeToken(token: string): string {
    return crypto
      .createHmac("sha256", process.env.HASHED_CHANGE_EMAIL_SECRET!)
      .update(token)
      .digest("hex");
  }
  hashVerificationToken(token: string): string {
    return crypto
      .createHmac("sha256", process.env.HASHED_VERIFICATION_SECRET!)
      .update(token)
      .digest("hex");
  }
  hashFingerprint = (fp: string) =>
    crypto.createHash("sha256").update(fp).digest("hex");
  getResetPasswordTokenExpiry(): Date {
    return new Date(
      Date.now() +
        Number(process.env.HASHED_RESET_PASSWORD_SECRET_EXPIRES_IN || 10) *
          60 *
          1000
    );
  }

  getVerificationTokenExpiry(): Date {
    return new Date(
      Date.now() +
        Number(process.env.HASHED_VERIFICATION_SECRET_EXPIRES_IN || 10) *
          60 *
          1000
    );
  }
  generateEmailChangeTokenAndHashed(): {
    token: string;
    hashedToken: string;
  } {
    const token = crypto.randomBytes(32).toString("hex");
    const hashedToken = this.hashEmailChangeToken(token);
    return {
      token,
      hashedToken,
    };
  }
  //   getAccessTokenExpiry(): Date {
  //     return process.env.JWT_ACCESS_TOKEN_EXPIRES_IN;
  //   }
  generateForceRestPassword(): string {
    const length = Math.floor(Math.random() * (35 - 10 + 1)) + 10; // Random length between 10 and 35
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const specialChars = "@!$%*?&";
    const allChars = uppercase + lowercase + numbers + specialChars;

    let password = "";

    // Ensure at least one character from each required category
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += specialChars[Math.floor(Math.random() * specialChars.length)];

    // Fill the rest with random characters
    for (let i = password.length; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle password to randomize character positions
    return password
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");
  }

  async clearRefreshTokenCookies() {
    (await cookies()).set(this.COOKIE_NAME, "", {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      secure: process.env.NODE_ENV === "production",
      expires: new Date(0),
      path: "/",
      priority: "high",
      partitioned: true,
    });
  }
  async setRefreshTokenCookies(token: string) {
    (await cookies()).set(this.COOKIE_NAME, token, {
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
