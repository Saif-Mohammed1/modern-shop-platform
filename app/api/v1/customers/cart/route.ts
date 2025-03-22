import { type NextRequest } from "next/server";
import { connectDB } from "@/app/_server/db/db";
import { AuthMiddleware } from "@/app/_server/middlewares/auth.middleware";
import ErrorHandler from "@/app/_server/controllers/error.controller";
import cartController from "@/app/_server/controllers/cart.controller";
export const GET = async (req: NextRequest) => {
  try {
    await connectDB();

    await AuthMiddleware.requireAuth()(req);

    return await cartController.getMyCart(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
