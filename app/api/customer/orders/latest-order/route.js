import { isAuth } from "@/app/_server/controller/authController";
import ErrorHandler from "@/app/_server/controller/errorController";
import { getLatestOrder } from "@/app/_server/controller/orderController";
import { connectDB } from "@/app/_server/db/db";
import Order from "@/app/_server/models/order.model ";
import { NextResponse } from "next/server";
export const GET = async (req) => {
  try {
    await connectDB();

    await isAuth(req);
    const { data, statusCode } = await getLatestOrder(req, Order);

    return NextResponse.json(
      {
        data,
      },
      { status: statusCode }
    );
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
