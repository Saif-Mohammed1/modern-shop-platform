import {
  forgetPassword,
  validateToken,
} from "@/app/_server/controller/authController";
import ErrorHandler from "@/app/_server/controller/errorController";
import { connectDB } from "@/app/_server/db/db";
import { NextResponse } from "next/server";

export const POST = async (req) => {
  try {
    //console.log("forget-password route");
    await connectDB();
    //   .then((re) => ////console.log("success connect to db"))
    //   .catch((re) => ////console.log("failed connect to db"));

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
export const PATCH = async (req) => {
  try {
    await connectDB();
    //   .then((re) => ////console.log("success connect to db"))
    //   .catch((re) => ////console.log("failed connect to db"));

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
