import ErrorHandler from "@/app/_server/controllers/error.controller";
import orderController from "@/app/_server/controllers/order.controller";
import { connectDB } from "@/app/_server/db/db";
import { AuthMiddleware } from "@/app/_server/middlewares/auth.middleware";
import { UserRole } from "@/app/lib/types/users.types";
import { type NextRequest } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    await connectDB();
    await AuthMiddleware.requireAuth([UserRole.ADMIN, UserRole.MODERATOR])(req);
    return await orderController.getOrders(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
