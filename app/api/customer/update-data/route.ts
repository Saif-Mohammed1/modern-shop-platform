import { isAuth } from "@/app/_server/controller/authController";
import ErrorHandler from "@/app/_server/controller/errorController";
import { updateOne } from "@/app/_server/controller/factoryController";
import { connectDB } from "@/app/_server/db/db";
import User, { IUserSchema } from "@/app/_server/models/user.model";
import { type NextRequest, NextResponse } from "next/server";

export const PUT = async (req: NextRequest) => {
  try {
    await connectDB();
    await isAuth(req);
    req.id = String(req.user?._id);
    const { data, statusCode } = await updateOne<IUserSchema>(req, User, [
      "name",
    ]);
    return NextResponse.json({ data }, { status: statusCode });
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
