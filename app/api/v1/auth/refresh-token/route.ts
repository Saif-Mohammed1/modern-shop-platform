import { isAuth } from "@/app/_server/controllers/authController";
import ErrorHandler from "@/app/_server/controllers/errorController";
import { RefreshTokenService } from "@/app/_server/controllers/refreshTokenController";
// import {
//   deleteAllUserRefreshTokens,
//   refreshAccessToken,
// } from "@/app/_server/controller/refreshTokenController";
import { connectDB } from "@/app/_server/db/db";
import { type NextRequest, NextResponse } from "next/server";
export const GET = async (req: NextRequest) => {
  try {
    await connectDB();
    const { accessToken, statusCode } =
      await RefreshTokenService.refreshAccessToken(req);

    return NextResponse.json(
      {
        accessToken,
      },
      { status: statusCode }
    );
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
export const DELETE = async (req: NextRequest) => {
  try {
    await connectDB();
    await isAuth(req);

    const { message, statusCode } =
      await RefreshTokenService.revokeAllUserTokens(req);

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
