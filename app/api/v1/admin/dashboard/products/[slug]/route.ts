import ErrorHandler from "@/app/_server/controllers/error.controller";
import productController from "@/app/_server/controllers/product.controller";
import { connectDB } from "@/app/_server/db/db";
import { AuthMiddleware } from "@/app/_server/middlewares/auth.middleware";
import { UserRole } from "@/app/lib/types/users.types";
import { type NextRequest } from "next/server";

export const GET = async (
  req: NextRequest,
  {
    params,
  }: {
    params: { slug: string };
  }
) => {
  const { slug } = params;
  try {
    await connectDB();
    await AuthMiddleware.requireAuth([UserRole.ADMIN, UserRole.MODERATOR])(req);
    req.slug = slug;
    return await productController.getProductBySlug(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
export const PUT = async (
  req: NextRequest,
  {
    params,
  }: {
    params: { slug: string };
  }
) => {
  const { slug } = params;
  try {
    await connectDB();
    await AuthMiddleware.requireAuth([UserRole.ADMIN])(req);
    req.slug = slug;

    /**      name,
      category,
      description,
      price,
      discount,
      stock,
      images,
      discountExpire, */
    return await productController.updateProduct(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
export const DELETE = async (
  req: NextRequest,
  {
    params,
  }: {
    params: { slug: string };
  }
) => {
  const { slug } = params;
  try {
    await connectDB();
    await AuthMiddleware.requireAuth([UserRole.ADMIN])(req);
    req.slug = slug;
    return await productController.deleteProduct(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
