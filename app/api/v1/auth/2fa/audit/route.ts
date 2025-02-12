import { TwoFactorAuthService } from "@/app/_server/controllers/2faController";
import { isAuth } from "@/app/_server/controllers/authController";
import ErrorHandler from "@/app/_server/controllers/errorController";
import { connectDB } from "@/app/_server/db/db";
import { type NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    await connectDB();
    await isAuth(req);
    const { logs, statusCode } = await TwoFactorAuthService.getAuditLogs(req);

    return NextResponse.json(
      {
        logs: logs,
      },
      { status: statusCode }
    );
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
