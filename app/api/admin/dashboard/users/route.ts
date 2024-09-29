import { isAuth, restrictTo } from "@/app/_server/controller/authController";
import ErrorHandler from "@/app/_server/controller/errorController";
import { getAll } from "@/app/_server/controller/factoryController";
import { createUserByAdmin } from "@/app/_server/controller/userController";
import { connectDB } from "@/app/_server/db/db";
import User from "@/app/_server/models/user.model";
import { type NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    await connectDB();
    await isAuth(req);
    await restrictTo(req, "admin");
    const { data, pageCount, statusCode } = await getAll(req, User);
    return NextResponse.json({ data, pageCount }, { status: statusCode });
  } catch (error) {
    return ErrorHandler(error, req);
  }
};

export const POST = async (req: NextRequest) => {
  try {
    await connectDB();
    await isAuth(req);
    await restrictTo(req, "admin");
    req.id = String(req.user?._id);
    const { message, statusCode } = await createUserByAdmin(req);
    return NextResponse.json({ message }, { status: statusCode });
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
