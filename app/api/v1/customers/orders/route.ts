import ErrorHandler from "@/app/_server/controllers/error.controller";
import orderController from "@/app/_server/controllers/order.controller";
import { createStripeProduct } from "@/app/_server/controllers/stripeController";
import { connectDB } from "@/app/_server/db/db";
import { AuthMiddleware } from "@/app/_server/middlewares/auth.middleware";
import { type NextRequest, NextResponse } from "next/server";
export const GET = async (req: NextRequest) => {
  try {
    await connectDB();
    await AuthMiddleware.requireAuth()(req);
    return orderController.getOrdersByUserId(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};

export const POST = async (req: NextRequest) => {
  try {
    await connectDB();

    await AuthMiddleware.requireAuth()(req);
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
