import { type NextRequest } from "next/server";
import { connectDB } from "@/app/_server/db/db";
import { AuthMiddleware } from "@/app/_server/middlewares/auth.middleware";
import ErrorHandler from "@/app/_server/controllers/error.controller";
import reviewController from "@/app/_server/controllers/review.controller";

export const GET = async (
  req: NextRequest,
  {
    params,
  }: {
    params: { id: string };
  }
) => {
  const { id } = params;
  try {
    await connectDB();
    req.id = id;

    return await reviewController.getProductReviews(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};

export const POST = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  const { id } = params;
  try {
    await connectDB();
    await AuthMiddleware.requireAuth()(req);
    req.id = id;
    // await checkReview(req);
    // const { data, statusCode } = await createReviews(req);
    // return NextResponse.json({ data }, { status: statusCode });
    return await reviewController.createReview(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
export const PATCH = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  const { id } = params;
  try {
    await connectDB();
    await AuthMiddleware.requireAuth()(req);
    req.id = id;
    return await reviewController.checkReview(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
//api/customers/reviews/route.js
