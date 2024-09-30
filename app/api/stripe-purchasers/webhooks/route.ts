// import { isAuth } from "@/app/server/controller/authController";

import ErrorHandler from "@/app/_server/controller/errorController";
import { handleStripeWebhook } from "@/app/_server/controller/stripeController";
import { connectDB } from "@/app/_server/db/db";
import { type NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    await connectDB();
    // await isAuth(req);
    // const searchParams = new URLSearchParams(req.nextUrl.searchParams);
    // const sessionId = searchParams.get("session_id");

    const result = await handleStripeWebhook(req);
    if (!result) {
      throw new Error("Error in stripe webhook");
    }
    if ("statusCode" in result) {
      const { session, statusCode } = result;
      return NextResponse.json({ session }, { status: statusCode });
    } else {
      throw new Error("Invalid result from stripe webhook");
    }
    // const { data, statusCode } = await captureSuccessPayment(req, sessionId);
    // return NextResponse.json({ sessionId, url }, { status: statusCode });
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
