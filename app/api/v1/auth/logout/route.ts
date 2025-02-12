import { isAuth, logout } from "@/app/_server/controllers/authController";
import ErrorHandler from "@/app/_server/controllers/errorController";
import { RefreshTokenService } from "@/app/_server/controllers/refreshTokenController";
// import { deleteRefreshTokenOnLogOut } from "@/app/_server/controller/refreshTokenController";
import { connectDB } from "@/app/_server/db/db";
import { type NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    await connectDB();
    await isAuth(req);
    const { data, statusCode } = await logout();
    // await deleteRefreshTokenOnLogOut(req);
    await RefreshTokenService.revokeToken(req);

    return NextResponse.json(
      {
        data,
      },
      { status: statusCode }
    );
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
