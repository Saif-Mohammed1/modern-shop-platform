import { TwoFactorAuthService } from "@/app/_server/controllers/2faController";
import { isAuth } from "@/app/_server/controllers/authController";
import ErrorHandler from "@/app/_server/controllers/errorController";
import { connectDB } from "@/app/_server/db/db";
import { type NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    await connectDB();
    await isAuth(req);
    const { message, statusCode } = await TwoFactorAuthService.verify2FA(req);

    return NextResponse.json(
      {
        message,
      },
      { status: statusCode }
    );
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
export const PUT = async (req: NextRequest) => {
  try {
    await connectDB();
    // await isAuth(req);

    const { user, statusCode } =
      await TwoFactorAuthService.verify2FAOnLogin(req);

    return NextResponse.json(
      {
        user,
      },
      { status: statusCode }
    );
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
