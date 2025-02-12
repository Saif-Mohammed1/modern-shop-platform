import { isAuth, restrictTo } from "@/app/_server/controllers/authController";
import ErrorHandler from "@/app/_server/controllers/errorController";
import { getAll } from "@/app/_server/controllers/factoryController";
import { createUserByAdmin } from "@/app/_server/controllers/userController";
import { connectDB } from "@/app/_server/db/db";
import User, { IUserSchema } from "@/app/_server/models/user.model";
import { type NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    await connectDB();
    await isAuth(req);
    await restrictTo(req, "admin");
    const { data, pageCount, statusCode } = await getAll<IUserSchema>(
      req,
      User
    );
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
