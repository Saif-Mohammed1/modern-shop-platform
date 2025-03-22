import { type NextRequest } from "next/server";
import { connectDB } from "@/app/_server/db/db";
import { AuthMiddleware } from "@/app/_server/middlewares/auth.middleware";
import { UserRole } from "@/app/lib/types/users.types";
import ErrorHandler from "@/app/_server/controllers/error.controller";
import productController from "@/app/_server/controllers/product.controller";
// /admin/dashboard/products/[slug]/history
export const POST = async (
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
    return await productController.restoreProduct(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
