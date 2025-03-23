import { type NextRequest } from "next/server";
import { connectDB } from "@/app/server/db/db";
import { AuthMiddleware } from "@/app/server/middlewares/auth.middleware";
import ErrorHandler from "@/app/server/controllers/error.controller";
import cartController from "@/app/server/controllers/cart.controller";
export const GET = async (req: NextRequest) => {
  try {
    await connectDB();

    await AuthMiddleware.requireAuth()(req);

    return await cartController.getMyCart(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
