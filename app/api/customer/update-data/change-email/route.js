import { isAuth } from "@/app/_server/controller/authController";
import ErrorHandler from "@/app/_server/controller/errorController";
import { changeEmailRequest } from "@/app/_server/controller/userController";
import { connectDB } from "@/app/_server/db/db";
import { NextResponse } from "next/server";

export const POST = async (req) => {
  try {
    await connectDB();
    await isAuth(req);
    const { message, statusCode } = await changeEmailRequest(req);
    return NextResponse.json({ message }, { status: statusCode });
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
