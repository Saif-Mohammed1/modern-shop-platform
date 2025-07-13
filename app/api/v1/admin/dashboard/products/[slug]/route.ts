import { type NextRequest } from "next/server";

import { UserRole } from "@/app/lib/types/users.db.types";
import ErrorHandler from "@/app/server/controllers/error.controller";
import productController from "@/app/server/controllers/product.controller";
import { AuthMiddleware } from "@/app/server/middlewares/auth.middleware";

export const GET = async (
  req: NextRequest,
  props: {
    params: Promise<{ slug: string }>;
  }
) => {
  const params = await props.params;
  const { slug } = params;
  try {
    await AuthMiddleware.requireAuth([UserRole.ADMIN, UserRole.MODERATOR])(req);
    req.slug = slug;
    return await productController.getProductMetaDataBySlug(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
export const PUT = async (
  req: NextRequest,
  props: {
    params: Promise<{ slug: string }>;
  }
) => {
  const params = await props.params;
  const { slug } = params;
  try {
    await AuthMiddleware.requireAuth([UserRole.ADMIN])(req);
    req.slug = slug;

    /**      name,
      category,
      description,
      price,
      discount,
      stock,
      images,
      discount_expire, */
    return await productController.updateProduct(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
export const DELETE = async (
  req: NextRequest,
  props: {
    params: Promise<{ slug: string }>;
  }
) => {
  const params = await props.params;
  const { slug } = params;
  try {
    await AuthMiddleware.requireAuth([UserRole.ADMIN])(req);
    req.slug = slug;
    return await productController.deleteProduct(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
