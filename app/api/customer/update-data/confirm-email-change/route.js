import { isAuth } from "@/app/_server/controller/authController";
import ErrorHandler from "@/app/_server/controller/errorController";
import { updateUserEmail } from "@/app/_server/controller/userController";
import { connectDB } from "@/app/_server/db/db";
import { NextResponse } from "next/server";

export const PUT = async (req) => {
  try {
    await connectDB();
    await isAuth(req);
    const { message, statusCode } = await updateUserEmail(req);
    return NextResponse.json({ message }, { status: statusCode });
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
