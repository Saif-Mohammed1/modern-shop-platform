import ErrorHandler from "@/app/_server/controller/errorController";
import { getOneProductAndRelatedProductsAndReviews } from "@/app/_server/controller/productController";
import { connectDB } from "@/app/_server/db/db";
import { type NextRequest, NextResponse } from "next/server";
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
    const { data, statusCode } =
      await getOneProductAndRelatedProductsAndReviews(req);
    return NextResponse.json({ data }, { status: statusCode });
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
