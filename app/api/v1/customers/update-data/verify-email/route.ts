// /api/v1/customers/update-data/verify-email
import { type NextRequest } from "next/server";
import { connectDB } from "@/app/server/db/db";
import { AuthMiddleware } from "@/app/server/middlewares/auth.middleware";
import ErrorHandler from "@/app/server/controllers/error.controller";
import authController from "@/app/server/controllers/auth.controller";

export const GET = async (req: NextRequest) => {
  try {
    await AuthMiddleware.requireAuth()(req);
    return await authController.sendNewVerificationCode(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};

export const PUT = async (req: NextRequest) => {
  try {
    await connectDB();
    await AuthMiddleware.requireAuth()(req);
    return await authController.verifyEmail(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
