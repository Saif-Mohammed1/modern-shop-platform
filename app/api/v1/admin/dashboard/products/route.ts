import { type NextRequest } from "next/server";

import { UserRole } from "@/app/lib/types/users.db.types";
import ErrorHandler from "@/app/server/controllers/error.controller";
import productController from "@/app/server/controllers/product.controller";
import { AuthMiddleware } from "@/app/server/middlewares/auth.middleware";

export const GET = async (req: NextRequest) => {
  try {
    await AuthMiddleware.requireAuth([UserRole.ADMIN, UserRole.MODERATOR])(req);

    return await productController.getProductsByAdmin(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
export const POST = async (req: NextRequest) => {
  try {
    await AuthMiddleware.requireAuth([UserRole.ADMIN])(req);

    return await productController.createProduct(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
