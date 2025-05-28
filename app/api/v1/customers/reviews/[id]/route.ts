import { type NextRequest } from "next/server";

import ErrorHandler from "@/app/server/controllers/error.controller";
import reviewController from "@/app/server/controllers/review.controller";
import { AuthMiddleware } from "@/app/server/middlewares/auth.middleware";

export const GET = async (
  req: NextRequest,
  props: {
    params: Promise<{ id: string }>;
  }
) => {
  const params = await props.params;
  const { id } = params;
  try {
    req.id = id;

    return await reviewController.getProductReviews(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};

export const POST = async (
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) => {
  const params = await props.params;
  const { id } = params;
  try {
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
  props: { params: Promise<{ id: string }> }
) => {
  const params = await props.params;
  const { id } = params;
  try {
    await AuthMiddleware.requireAuth()(req);
    req.id = id;
    return await reviewController.checkReview(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
//api/customers/reviews/route.js
