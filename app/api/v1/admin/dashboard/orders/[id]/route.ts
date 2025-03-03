import ErrorHandler from "@/app/_server/controllers/error.controller";
import orderController from "@/app/_server/controllers/order.controller";

import { connectDB } from "@/app/_server/db/db";
import { AuthMiddleware } from "@/app/_server/middlewares/auth.middleware";
import { UserRole } from "@/app/lib/types/users.types";
import { type NextRequest } from "next/server";

export const GET = async (
  req: NextRequest,
  {
    params,
  }: {
    params: { id: string };
  }
) => {
  const { id } = params;
  try {
    await connectDB();
    await AuthMiddleware.requireAuth([UserRole.ADMIN, UserRole.MODERATOR])(req);
    req.id = id;

    return await orderController.getOrderById(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};

export const PUT = async (
  req: NextRequest,
  {
    params,
  }: {
    params: { id: string };
  }
) => {
  const { id } = params;
  try {
    await connectDB();
    await AuthMiddleware.requireAuth([UserRole.ADMIN, UserRole.MODERATOR])(req);
    req.id = id;

    return await orderController.updateOrderStatus(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
export const DELETE = async (
  req: NextRequest,
  {
    params,
  }: {
    params: { id: string };
  }
) => {
  const { id } = params;
  try {
    await connectDB();
    await AuthMiddleware.requireAuth([UserRole.ADMIN])(req);
    req.id = id;

    return await orderController.deleteOrder(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
