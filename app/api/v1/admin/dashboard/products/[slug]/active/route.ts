import { type NextRequest } from "next/server";
import { connectDB } from "@/app/_server/db/db";
import { AuthMiddleware } from "@/app/_server/middlewares/auth.middleware";
import { UserRole } from "@/app/lib/types/users.types";
import ErrorHandler from "@/app/_server/controllers/error.controller";
import productController from "@/app/_server/controllers/product.controller";
// /admin/dashboard/products/[slug]/active
export const PUT = async (
  req: NextRequest,
  props: {
    params: Promise<{ slug: string }>;
  }
) => {
  const params = await props.params;
  const { slug } = params;
  try {
    await connectDB();
    await AuthMiddleware.requireAuth([UserRole.ADMIN])(req);
    req.slug = slug;
    return productController.toggleProductActivity(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
