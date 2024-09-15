import { logIn } from "@/app/_server/controller/authController";
import ErrorHandler from "@/app/_server/controller/errorController";
import { connectDB } from "@/app/_server/db/db";
import { NextResponse } from "next/server";

export const POST = async (req) => {
  try {
    await connectDB();
    //   .then((re) => ////console.log("success connect to db"))
    //   .catch((re) => ////console.log("failed connect to db"));

    const { user, accessToken, statusCode } = await logIn(req);

    return NextResponse.json(
      {
        ...user,
        accessToken,
      },
      { status: statusCode }
    );
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
