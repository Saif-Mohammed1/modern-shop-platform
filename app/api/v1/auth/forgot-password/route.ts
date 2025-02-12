import {
  forgetPassword,
  validateToken,
} from "@/app/_server/controllers/authController";
import ErrorHandler from "@/app/_server/controllers/errorController";
import { connectDB } from "@/app/_server/db/db";
import { type NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    await connectDB();
    const { message, statusCode } = await forgetPassword(req);

    return NextResponse.json(
      {
        message,
      },
      { status: statusCode }
    );
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
export const PATCH = async (req: NextRequest) => {
  try {
    await connectDB();

    const { message, statusCode } = await validateToken(req);

    return NextResponse.json(
      {
        message,
      },
      { status: statusCode }
    );
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
