import { isAuth } from "@/app/_server/controller/authController";
import ErrorHandler from "@/app/_server/controller/errorController";
import { deleteAllUserRefreshTokens } from "@/app/_server/controller/refreshTokenController";
import { deleteUser } from "@/app/_server/controller/userController";
import { connectDB } from "@/app/_server/db/db";
import User from "@/app/_server/models/user.model";
import { NextResponse } from "next/server";

export const DELETE = async (req) => {
  try {
    await connectDB();
    await isAuth(req);
    req.id = req.user._id;
    const { data, statusCode } = await deleteUser(req, User);
    await deleteAllUserRefreshTokens(req);
    return NextResponse.json({ data }, { status: statusCode });
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
