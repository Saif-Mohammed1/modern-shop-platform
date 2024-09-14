// import { isAuth } from "@/app/server/controller/authController";

import ErrorHandler from "@/app/_server/controller/errorController";
import { handleStripeWebhook } from "@/app/_server/controller/stripeController";
import { connectDB } from "@/app/_server/db/db";
import { NextResponse } from "next/server";

export const POST = async (req) => {
  try {
    await connectDB();
    // await isAuth(req);
    // const searchParams = new URLSearchParams(req.nextUrl.searchParams);
    // const sessionId = searchParams.get("session_id");

    const { data = null, statusCode = 200 } = await handleStripeWebhook(req);
    // const { data, statusCode } = await captureSuccessPayment(req, sessionId);
    // return NextResponse.json({ sessionId, url }, { status: statusCode });
    return NextResponse.json({ data }, { status: statusCode });
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
