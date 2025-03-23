export const dynamic = "force-static";
export const revalidate = 60 * 10;
import { type NextRequest } from "next/server";
import { connectDB } from "@/app/_server/db/db";
import ErrorHandler from "@/app/_server/controllers/error.controller";
import productController from "@/app/_server/controllers/product.controller";
export const GET = async (
  req: NextRequest,
  props: {
    params: Promise<{ slug: string }>;
  }
) => {
  const params = await props.params;
  const { slug } = params;
  try {
    await connectDB();
    req.slug = slug;
    return await productController.getProductMetaDataBySlug(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
