import { restPassword } from "@/app/_server/controller/authController";
import ErrorHandler from "@/app/_server/controller/errorController";
import { connectDB } from "@/app/_server/db/db";
import { type NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  //   const { userId } = params;
  //   req.userId = userId;
  try {
    await connectDB();
    const { message, statusCode } = await restPassword(req);
    return NextResponse.json({ message }, { status: statusCode });
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
