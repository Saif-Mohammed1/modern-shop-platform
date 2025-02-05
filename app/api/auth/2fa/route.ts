import { TwoFactorAuthService } from "@/app/_server/controller/2faController";
import { isAuth } from "@/app/_server/controller/authController";
import ErrorHandler from "@/app/_server/controller/errorController";
import { connectDB } from "@/app/_server/db/db";
import { type NextRequest, NextResponse } from "next/server";
/**
1. POST /api/auth/2fa - Handles 2FA setup initialization.

2. POST /api/auth/2fa/verify - Verifies the TOTP token during setup.

3. POST /api/auth/2fa/disable - Disables 2FA for the user.

4. POST /api/auth/2fa/backup/verify - Verifies a backup code.

5. POST /api/auth/2fa/recovery - Regenerates backup codes.

6. GET /api/auth/2fa/audit - Fetches audit logs.
 */
export const PUT = async (req: NextRequest) => {
  try {
    await connectDB();
    const { message, tempToken, tempTokenExpires, statusCode } =
      await TwoFactorAuthService.generateSessionToken(req);

    return NextResponse.json(
      {
        message,
        tempToken,
        tempTokenExpires,
      },
      { status: statusCode }
    );
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
export const POST = async (req: NextRequest) => {
  try {
    await connectDB();
    await isAuth(req);
    const { backupCodes, manualEntryCode, qrCode, statusCode } =
      await TwoFactorAuthService.initialize2FA(req);

    return NextResponse.json(
      {
        backupCodes,
        manualEntryCode,
        qrCode,
      },
      { status: statusCode }
    );
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
