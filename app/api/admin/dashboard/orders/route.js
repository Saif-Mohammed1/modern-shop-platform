import { isAuth, restrictTo } from "@/app/_server/controller/authController";
import ErrorHandler from "@/app/_server/controller/errorController";
import { getAll } from "@/app/_server/controller/factoryController";
import { connectDB } from "@/app/_server/db/db";
import Order from "@/app/_server/models/order.model ";
import { NextResponse } from "next/server";

export const GET = async (req) => {
  try {
    await connectDB();
    await isAuth(req);
    await restrictTo(req, "admin");
    const { data, pageCount, statusCode } = await getAll(req, Order);
    return NextResponse.json({ data, pageCount }, { status: statusCode });
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
