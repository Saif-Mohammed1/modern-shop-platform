import { TwoFactorAuthService } from "@/app/_server/controller/2faController";
import { isAuth } from "@/app/_server/controller/authController";
import ErrorHandler from "@/app/_server/controller/errorController";
import { connectDB } from "@/app/_server/db/db";
import { type NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    await connectDB();
    await isAuth(req);
    const { newCodes, statusCode } =
      await TwoFactorAuthService.reGenerateBackupCodes(req);

    return NextResponse.json(
      {
        newCodes,
      },
      { status: statusCode }
    );
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
