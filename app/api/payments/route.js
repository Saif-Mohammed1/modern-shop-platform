import { isAuth } from "@/app/_server/controller/authController";
import ErrorHandler from "@/app/_server/controller/errorController";
import { createStripeProduct } from "@/app/_server/controller/stripeController";
import { connectDB } from "@/app/_server/db/db";
import { NextResponse } from "next/server";

export const POST = async (req) => {
  try {
    await connectDB();
    await isAuth(req);
    const { data, statusCode } = await createStripeProduct(req);
    return NextResponse.json({ data }, { status: statusCode });
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
