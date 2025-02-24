export const dynamic = "force-static";
export const revalidate = 60 * 10;
import ErrorHandler from "@/app/_server/controllers/error.controller";
import productController from "@/app/_server/controllers/product.controller";
import { connectDB } from "@/app/_server/db/db";
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
    req.slug = slug;
    return await productController.getProductBySlug(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
