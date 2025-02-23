// /api/v1/customers/update-data/verify-email
import authController from "@/app/_server/controllers/auth.controller";
import ErrorHandler from "@/app/_server/controllers/errorController";

import { connectDB } from "@/app/_server/db/db";
import { AuthMiddleware } from "@/app/_server/middlewares/auth.middleware";
import { type NextRequest } from "next/server";

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
