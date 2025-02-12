import { isAuth } from "@/app/_server/controllers/authController";
import ErrorHandler from "@/app/_server/controllers/errorController";
import { RefreshTokenService } from "@/app/_server/controllers/refreshTokenController";
import { deleteUser } from "@/app/_server/controllers/userController";
import { connectDB } from "@/app/_server/db/db";
import User from "@/app/_server/models/user.model";
import { type NextRequest, NextResponse } from "next/server";

export const DELETE = async (req: NextRequest) => {
  try {
    await connectDB();
    await isAuth(req);
    req.id = String(req.user?._id);
    const { data, statusCode } = await deleteUser(req, User);
    await RefreshTokenService.revokeAllUserTokens(req);
    return NextResponse.json({ data }, { status: statusCode });
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
