// /api/v1/customers/update-data/verify-email
import { type NextRequest } from "next/server";

import authController from "@/app/server/controllers/auth.controller";
import ErrorHandler from "@/app/server/controllers/error.controller";
import { AuthMiddleware } from "@/app/server/middlewares/auth.middleware";

export const GET = async (req: NextRequest) => {
  try {
    await AuthMiddleware.requireAuthUnverified()(req);
    return await authController.sendNewVerificationCode(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};

export const PUT = async (req: NextRequest) => {
  try {
    await AuthMiddleware.requireAuthUnverified()(req);
    return await authController.verifyEmail(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
