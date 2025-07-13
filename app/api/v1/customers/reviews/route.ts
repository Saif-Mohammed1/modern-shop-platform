import { type NextRequest } from "next/server";

import ErrorHandler from "@/app/server/controllers/error.controller";
import reviewController from "@/app/server/controllers/review.controller";
import { AuthMiddleware } from "@/app/server/middlewares/auth.middleware";

export const GET = async (req: NextRequest) => {
  try {
    await AuthMiddleware.requireAuth()(req);
    req.id = String(req.user?._id);
    return await reviewController.getMyReviews(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
