import { isAuth } from "@/app/_server/controller/authController";
import ErrorHandler from "@/app/_server/controller/errorController";
import { getDataByUser } from "@/app/_server/controller/factoryController";
import { createStripeProduct } from "@/app/_server/controller/stripeController";
import { connectDB } from "@/app/_server/db/db";
import Order from "@/app/_server/models/order.model ";
import { NextResponse } from "next/server";

export const GET = async (req) => {
  try {
    await connectDB();
    await isAuth(req);
    req.id = req.user._id;
    const { data, statusCode } = await getDataByUser(req, Order);
    return NextResponse.json({ data }, { status: statusCode });
  } catch (error) {
    return ErrorHandler(error, req);
  }
};

export const POST = async (req) => {
  try {
    await connectDB();

    await isAuth(req);
    const { sessionId, url, statusCode } = await createStripeProduct(req);

    return NextResponse.json(
      {
        sessionId,
        url,
      },
      { status: statusCode }
    );
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
