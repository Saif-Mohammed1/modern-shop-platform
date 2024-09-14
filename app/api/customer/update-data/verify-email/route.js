import { isAuth } from "@/app/_server/controller/authController";
import ErrorHandler from "@/app/_server/controller/errorController";
import {
  sendNewVerificationCode,
  verifyEmail,
} from "@/app/_server/controller/userController";
import { connectDB } from "@/app/_server/db/db";
import { NextResponse } from "next/server";

export const GET = async (req) => {
  try {
    await connectDB();
    await isAuth(req);
    const { data, statusCode } = await sendNewVerificationCode(req);
    return NextResponse.json({ data }, { status: statusCode });
  } catch (error) {
    return ErrorHandler(error, req);
  }
};

export const PUT = async (req) => {
  try {
    await connectDB();
    await isAuth(req);
    const { data, statusCode } = await verifyEmail(req);
    return NextResponse.json({ data }, { status: statusCode });
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
