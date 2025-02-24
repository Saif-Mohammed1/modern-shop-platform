import ErrorHandler from "@/app/_server/controllers/error.controller";
import orderController from "@/app/_server/controllers/order.controller";
import connectDB from "@/app/_server/db/db";
import { AuthMiddleware } from "@/app/_server/middlewares/auth.middleware";
import { type NextRequest } from "next/server";
export const GET = async (req: NextRequest) => {
  try {
    await connectDB();

    await AuthMiddleware.requireAuth()(req);
    return orderController.getLatestOrder(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
