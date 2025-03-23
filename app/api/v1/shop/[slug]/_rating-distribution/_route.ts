// Original path: shop/app/api/v1/shop/[slug]/rating-distribution
// This file is generated automatically.

// export const dynamic = "force-static";
// export const revalidate = 600;
// export const revalidate = 60 * 10; //doesn't work ;
import ErrorHandler from "@/app/server/controllers/error.controller";
import reviewController from "@/app/server/controllers/review.controller";
import { connectDB } from "@/app/server/db/db";
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
    return await reviewController.getRatingDistributionByProductId(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
