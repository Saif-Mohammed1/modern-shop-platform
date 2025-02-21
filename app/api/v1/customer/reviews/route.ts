import ErrorHandler from "@/app/_server/controllers/errorController";
import reviewController from "@/app/_server/controllers/review.controller";
import { connectDB } from "@/app/_server/db/db";
import { AuthService } from "@/app/_server/middlewares/auth.middleware";
import { type NextRequest } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    await connectDB();
    await AuthService.requireAuth()(req);
    req.id = String(req.user?._id);
    return await reviewController.getMyReviews(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
