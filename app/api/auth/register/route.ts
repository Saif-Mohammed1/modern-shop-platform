import { register } from "@/app/_server/controller/authController";
import ErrorHandler from "@/app/_server/controller/errorController";
import { connectDB } from "@/app/_server/db/db";
import { type NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    //console.log("register route");

    await connectDB();
    // .then((re) => ////console.log("success connect to db"))
    // .catch((re) => ////console.log("failed connect to db"));
    const { message, accessToken, statusCode } = await register(req);

    return NextResponse.json(
      {
        message,
        accessToken,
      },
      { status: statusCode }
    );
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
