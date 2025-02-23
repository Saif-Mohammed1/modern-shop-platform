// src/app/lib/features/2fa/2fa.controller.ts
import { NextRequest, NextResponse } from "next/server";

import { z } from "zod";
import AppError from "@/app/lib/utilities/appError";
import { TwoFactorValidation } from "../dtos/2fa.dto";
import { TwoFactorService } from "../services/2fa.service";
import { UserService } from "../services/user.service";
import { generateDeviceFingerprint } from "@/app/lib/utilities/DeviceFingerprint.utility";
import { SecurityMetadata } from "../models/2fa.model";
import { getDeviceFingerprint } from "@/app/lib/utilities/refresh-token.util";
import { cookies } from "next/headers";
import { UserValidation } from "../dtos/user.dto";

class TwoFactorController {
  constructor(
    private readonly twoFactorService = new TwoFactorService(),
    private readonly userService = new UserService()
  ) {}

  async initialize2FA(req: NextRequest) {
    try {
      const userId = this.getAuthenticatedUserId(req);
      const metadata = this.collectSecurityMetadata(req);
      const result = await this.twoFactorService.initialize2FA(
        userId,
        metadata
      );
      return this.successResponse(result);
    } catch (error) {
      // // return this.errorResponse(error);

      throw error;
    }
  }

  async verify2FA(req: NextRequest) {
    try {
      const userId = this.getAuthenticatedUserId(req);
      const metadata = this.collectSecurityMetadata(req);
      const { token } = await this.validateRequest(
        TwoFactorValidation.TwoFactorVerifySchema,
        req
      );
      const result = await this.twoFactorService.verify2FA(
        userId,
        token,
        metadata
      );
      return this.successResponse(result);
    } catch (error) {
      // // return this.errorResponse(error);
      throw error;
    }
  }
  async verify2FALogin(req: NextRequest) {
    try {
      const cookieTempToken =
        cookies().get("tempToken")?.value ||
        req.cookies.get("tempToken")?.value; // Get temporary token from cookies;

      const body = await req.json();
      const { tempToken, code } = TwoFactorValidation.validateTwoFactorLogin({
        tempToken: cookieTempToken,
        ...body,
      });

      const deviceInfo = await getDeviceFingerprint(req);
      const metadata = this.collectSecurityMetadata(req);

      const user = await this.twoFactorService.verifyLogin2FA(
        tempToken,
        code,
        metadata
      );

      //   const user = await this.userService.validateTempToken(tempToken);
      const finalResult = await this.userService.finalizeLogin(
        user,
        deviceInfo
      );
      return this.successResponse(finalResult);
    } catch (error) {
      // return this.errorResponse(error);
      throw error;
    }
  }
  async verifyBackupCode(req: NextRequest) {
    try {
      const userId = this.getAuthenticatedUserId(req);
      const metadata = this.collectSecurityMetadata(req);
      const { code } = await this.validateRequest(
        TwoFactorValidation.BackupCodeVerifySchema,
        req
      );
      const result = await this.twoFactorService.verifyBackupCode(
        userId,
        code,
        metadata
      );
      return this.successResponse(result);
    } catch (error) {
      // // return this.errorResponse(error);
      throw error;
    }
  }

  async disable2FA(req: NextRequest) {
    try {
      const userId = this.getAuthenticatedUserId(req);
      const metadata = this.collectSecurityMetadata(req);
      await this.validateRequest(
        TwoFactorValidation.TwoFactorDisableSchema,
        req
      );
      const result = await this.twoFactorService.disable2FA(userId, metadata);
      return this.successResponse(result);
    } catch (error) {
      // return this.errorResponse(error);
      throw error;
    }
  }

  async regenerateBackupCodes(req: NextRequest) {
    try {
      const userId = this.getAuthenticatedUserId(req);
      const metadata = this.collectSecurityMetadata(req);
      const result = await this.twoFactorService.regenerateBackupCodes(
        userId,
        metadata
      );
      return this.successResponse(result);
    } catch (error) {
      // return this.errorResponse(error);
      throw error;
    }
  }

  async getAuditLogs(req: NextRequest) {
    try {
      const userId = this.getAuthenticatedUserId(req);
      const result = await this.twoFactorService.getAuditLogs(userId);
      return this.successResponse({ logs: result });
    } catch (error) {
      // return this.errorResponse(error);
      throw error;
    }
  }

  async validateBackupCodes(req: NextRequest) {
    try {
      const { codes, email } = await this.validateRequest(
        TwoFactorValidation.BackupCodeValidationSchema,
        req
      );
      const deviceInfo = await getDeviceFingerprint(req);
      const result = await this.twoFactorService.validateBackupCodes(
        email,
        codes,
        deviceInfo
      );
      return this.successResponse(result);
    } catch (error) {
      // return this.errorResponse(error);
      throw error;
    }
  }

  private async validateRequest<T>(schema: z.ZodSchema<T>, req: NextRequest) {
    const body = await req.json();
    return schema.parseAsync(body);
  }

  private successResponse(data: unknown, status = 200) {
    const isObject = typeof data === "object";

    return NextResponse.json(
      {
        success: true,

        ...(isObject ? data : { data }),
      },
      { status }
    );
  }

  private errorResponse(error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors },
        { status: 400 }
      );
    }
    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }

  private getAuthenticatedUserId(req: NextRequest) {
    const userId = req.user?._id;
    if (!userId) throw new AppError("Unauthorized", 401);
    return userId;
  }
  private collectSecurityMetadata(req: NextRequest): SecurityMetadata {
    const clientIp =
      req.headers.get("x-client-ip") ||
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "Unknown IP";
    const userAgent = req.headers.get("user-agent") || "";
    const deviceHash = generateDeviceFingerprint({
      userAgent,
      ip: clientIp,
    });

    return {
      ipAddress: clientIp,
      userAgent: userAgent,
      deviceHash,
      location: req.headers.get("x-location") || "unknown",
    };
  }

  async generateSessionToken(req: NextRequest) {
    const body = await req.json();
    const email = UserValidation.isEmailValid(body.email);
    const result = await this.userService.generateSessionToken(email);
    return this.successResponse(result);
  }
}
export default new TwoFactorController();
