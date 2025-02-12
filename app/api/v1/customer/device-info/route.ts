import { isAuth } from "@/app/_server/controllers/authController";
import ErrorHandler from "@/app/_server/controllers/errorController";
import { RefreshTokenService } from "@/app/_server/controllers/refreshTokenController";
// import { getUniqueRefreshTokens } from "@/app/_server/controller/refreshTokenController";
import { connectDB } from "@/app/_server/db/db";
import { type NextRequest, NextResponse } from "next/server";
// /api/customer/device-info
export const GET = async (req: NextRequest) => {
  try {
    await connectDB();

    await isAuth(req);
    const { info, statusCode } =
      await RefreshTokenService.getActiveSessions(req);

    return NextResponse.json(
      {
        info,
      },
      { status: statusCode }
    );
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
