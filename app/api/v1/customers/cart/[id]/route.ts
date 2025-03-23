import { type NextRequest } from "next/server";
import { connectDB } from "@/app/server/db/db";
import { AuthMiddleware } from "@/app/server/middlewares/auth.middleware";
import ErrorHandler from "@/app/server/controllers/error.controller";
import cartController from "@/app/server/controllers/cart.controller";

export const POST = async (
  req: NextRequest,
  props: {
    params: Promise<{ id: string }>;
  }
) => {
  const params = await props.params;
  const { id } = params;
  try {
    await connectDB();
    await AuthMiddleware.requireAuth()(req);
    req.id = id;

    return await cartController.addToCart(req);
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
    await connectDB();
    await AuthMiddleware.requireAuth()(req);
    req.id = id;
    return await cartController.decreaseQuantity(req);
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
    await connectDB();
    await AuthMiddleware.requireAuth()(req);
    req.id = id;
    return await cartController.removeProductFromCart(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
