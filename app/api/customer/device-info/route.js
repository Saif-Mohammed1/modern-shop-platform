import { isAuth } from "@/app/_server/controller/authController";
import ErrorHandler from "@/app/_server/controller/errorController";
import { getUniqueRefreshTokens } from "@/app/_server/controller/refreshTokenController";
import { connectDB } from "@/app/_server/db/db";
import { NextResponse } from "next/server";
export const GET = async (req) => {
  try {
    await connectDB();

    await isAuth(req);
    const { data, statusCode } = await getUniqueRefreshTokens(req);

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
