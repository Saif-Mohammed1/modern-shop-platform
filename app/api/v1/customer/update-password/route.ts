import {
  isAuth,
  updatePassword,
} from "@/app/_server/controllers/authController";
import ErrorHandler from "@/app/_server/controllers/errorController";
import { connectDB } from "@/app/_server/db/db";
import { type NextRequest, NextResponse } from "next/server";

export const PATCH = async (req: NextRequest) => {
  //   const { userId } = params;
  //   req.userId = userId;
  try {
    await connectDB();
    await isAuth(req);
    const { message, statusCode } = await updatePassword(req);
    return NextResponse.json({ message }, { status: statusCode });
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
