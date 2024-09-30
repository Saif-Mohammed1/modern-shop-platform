import { isAuth, restrictTo } from "@/app/_server/controller/authController";
import ErrorHandler from "@/app/_server/controller/errorController";
import {
  deleteOne,
  getOne,
  updateOne,
} from "@/app/_server/controller/factoryController";
import { connectDB } from "@/app/_server/db/db";
import User, { IUserSchema } from "@/app/_server/models/user.model";
import { type NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest,
  {
    params,
  }: {
    params: { id: string };
  }
) => {
  const { id } = params;
  try {
    await connectDB();
    await isAuth(req);
    await restrictTo(req, "admin");
    req.id = id;
    const { data, statusCode } = await getOne<IUserSchema>(req, User);
    return NextResponse.json({ data }, { status: statusCode });
  } catch (error) {
    return ErrorHandler(error, req);
  }
};

export const PUT = async (
  req: NextRequest,
  {
    params,
  }: {
    params: { id: string };
  }
) => {
  const { id } = params;
  try {
    await connectDB();
    await isAuth(req);
    await restrictTo(req, "admin");
    req.id = id;
    const { data, statusCode } = await updateOne<IUserSchema>(req, User, [
      "name",
      "email",
      "role",
      "active",
    ]);

    return NextResponse.json({ data }, { status: statusCode });
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
export const DELETE = async (
  req: NextRequest,
  {
    params,
  }: {
    params: { id: string };
  }
) => {
  const { id } = params;
  try {
    await connectDB();
    await isAuth(req);
    await restrictTo(req, "admin");
    req.id = id;
    const { data, statusCode } = await deleteOne<IUserSchema>(req, User);

    return NextResponse.json({ data }, { status: statusCode });
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
