import { type NextRequest } from "next/server";

import { UserRole } from "@/app/lib/types/users.db.types";
import ErrorHandler from "@/app/server/controllers/error.controller";
import orderController from "@/app/server/controllers/order.controller";
import { AuthMiddleware } from "@/app/server/middlewares/auth.middleware";

export const GET = async (
  req: NextRequest,
  props: {
    params: Promise<{ id: string }>;
  }
) => {
  const params = await props.params;
  const { id } = params;
  try {
    await AuthMiddleware.requireAuth([UserRole.ADMIN, UserRole.MODERATOR])(req);
    req.id = id;

    return await orderController.getOrderById(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};

export const PUT = async (
  req: NextRequest,
  props: {
    params: Promise<{ id: string }>;
  }
) => {
  const params = await props.params;
  const { id } = params;
  try {
    await AuthMiddleware.requireAuth([UserRole.ADMIN, UserRole.MODERATOR])(req);
    req.id = id;

    return await orderController.updateOrderStatus(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
export const DELETE = async (
  req: NextRequest,
  props: {
    params: Promise<{ id: string }>;
  }
) => {
  const params = await props.params;
  const { id } = params;
  try {
    await AuthMiddleware.requireAuth([UserRole.ADMIN])(req);
    req.id = id;

    return await orderController.deleteOrder(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
