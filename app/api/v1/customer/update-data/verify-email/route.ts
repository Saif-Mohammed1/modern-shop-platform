import { isAuth } from "@/app/_server/controllers/authController";
import ErrorHandler from "@/app/_server/controllers/errorController";
import {
  sendNewVerificationCode,
  verifyEmail,
} from "@/app/_server/controllers/userController";
import { connectDB } from "@/app/_server/db/db";
import { type NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    await connectDB();
    await isAuth(req);
    const { message, statusCode } = await sendNewVerificationCode(req);
    return NextResponse.json({ message }, { status: statusCode });
  } catch (error) {
    return ErrorHandler(error, req);
  }
};

export const PUT = async (req: NextRequest) => {
  try {
    await connectDB();
    await isAuth(req);
    const { message, statusCode } = await verifyEmail(req);
    return NextResponse.json({ message }, { status: statusCode });
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
