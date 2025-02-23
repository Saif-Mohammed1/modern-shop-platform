import { isAuth } from "@/app/_server/controllers/authController";
import ErrorHandler from "@/app/_server/controllers/errorController";
import { RefreshTokenService } from "@/app/_server/controllers/refreshTokenController";
import { connectDB } from "@/app/_server/db/db";

import { type NextRequest, NextResponse } from "next/server";
export const DELETE = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  const { id } = params;
  try {
    await connectDB();
    await isAuth(req);
    req.id = id;
    const { message, statusCode } = await RefreshTokenService.revokeToken(req);
    return NextResponse.json({ message }, { status: statusCode });
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
