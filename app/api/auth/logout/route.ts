import { isAuth, logout } from "@/app/_server/controller/authController";
import ErrorHandler from "@/app/_server/controller/errorController";
import { deleteRefreshTokenOnLogOut } from "@/app/_server/controller/refreshTokenController";
import { connectDB } from "@/app/_server/db/db";
import { type NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    await connectDB();
    await isAuth(req);
    const { data, statusCode } = await logout();
    await deleteRefreshTokenOnLogOut(req);

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
