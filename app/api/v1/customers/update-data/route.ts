import { type NextRequest } from "next/server";

import authController from "@/app/server/controllers/auth.controller";
import ErrorHandler from "@/app/server/controllers/error.controller";
import { AuthMiddleware } from "@/app/server/middlewares/auth.middleware";

export const PUT = async (req: NextRequest) => {
  try {
    await AuthMiddleware.requireAuth()(req);
    return await authController.updateName(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
export const PATCH = async (req: NextRequest) => {
  try {
    await AuthMiddleware.requireAuth()(req);
    return await authController.updateLoginNotificationSent(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
