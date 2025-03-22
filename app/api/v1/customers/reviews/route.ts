import { type NextRequest } from "next/server";
import { connectDB } from "@/app/_server/db/db";
import { AuthMiddleware } from "@/app/_server/middlewares/auth.middleware";
import ErrorHandler from "@/app/_server/controllers/error.controller";
import reviewController from "@/app/_server/controllers/review.controller";

export const GET = async (req: NextRequest) => {
  try {
    await connectDB();
    await AuthMiddleware.requireAuth()(req);
    req.id = String(req.user?._id);
    return await reviewController.getMyReviews(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
