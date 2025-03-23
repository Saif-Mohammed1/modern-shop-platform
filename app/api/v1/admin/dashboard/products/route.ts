import { type NextRequest } from "next/server";
import { connectDB } from "@/app/server/db/db";
import { AuthMiddleware } from "@/app/server/middlewares/auth.middleware";
import { UserRole } from "@/app/lib/types/users.types";
import ErrorHandler from "@/app/server/controllers/error.controller";
import productController from "@/app/server/controllers/product.controller";
export const GET = async (req: NextRequest) => {
  try {
    await connectDB();
    await AuthMiddleware.requireAuth([UserRole.ADMIN, UserRole.MODERATOR])(req);

    return await productController.getProducts(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
export const POST = async (req: NextRequest) => {
  try {
    await connectDB();
    await AuthMiddleware.requireAuth([UserRole.ADMIN])(req);

    return await productController.createProduct(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
