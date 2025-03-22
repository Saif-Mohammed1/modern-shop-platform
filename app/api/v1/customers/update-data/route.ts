import { type NextRequest } from "next/server";
import { connectDB } from "@/app/_server/db/db";
import { AuthMiddleware } from "@/app/_server/middlewares/auth.middleware";
import ErrorHandler from "@/app/_server/controllers/error.controller";
import authController from "@/app/_server/controllers/auth.controller";
export const PUT = async (req: NextRequest) => {
  try {
    await connectDB();
    await AuthMiddleware.requireAuth()(req);
    return await authController.updateName(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
export const PATCH = async (req: NextRequest) => {
  try {
    await connectDB();
    await AuthMiddleware.requireAuth()(req);
    return await authController.updateLoginNotificationSent(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
