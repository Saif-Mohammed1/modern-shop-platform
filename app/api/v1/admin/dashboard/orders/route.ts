import { isAuth, restrictTo } from "@/app/_server/controllers/authController";
import ErrorHandler from "@/app/_server/controllers/errorController";
import { getOrders } from "@/app/_server/controllers/orderController";
import { connectDB } from "@/app/_server/db/db";
import { type NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    await connectDB();
    await isAuth(req);
    await restrictTo(req, "admin");
    const { orders, pageCount, statusCode } = await getOrders(req);
    return NextResponse.json({ orders, pageCount }, { status: statusCode });
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
