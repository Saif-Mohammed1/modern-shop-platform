import ErrorHandler from "@/app/_server/controllers/error.controller";
import productController from "@/app/_server/controllers/product.controller";
import { connectDB } from "@/app/_server/db/db";
import { AuthMiddleware } from "@/app/_server/middlewares/auth.middleware";
import { UserRole } from "@/app/_server/models/User.model";
import { type NextRequest } from "next/server";
export const GET = async (req: NextRequest) => {
  try {
    await connectDB();
    return await productController.getProducts(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
export const POST = async (req: NextRequest) => {
  try {
    await connectDB();
    await AuthMiddleware.requireAuth([UserRole.ADMIN, UserRole.MODERATOR])(req);
    return await productController.createProduct(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
