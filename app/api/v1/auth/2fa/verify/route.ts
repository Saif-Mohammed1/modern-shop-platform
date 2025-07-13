import { type NextRequest } from "next/server";

import twoFactorController from "@/app/server/controllers/2fa.controller";
import ErrorHandler from "@/app/server/controllers/error.controller";
import { AuthMiddleware } from "@/app/server/middlewares/auth.middleware";

export const POST = async (req: NextRequest) => {
  try {
    await AuthMiddleware.requireAuth()(req);
    return await twoFactorController.verify2FA(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
export const PUT = async (req: NextRequest) => {
  try {
    // await isAuth(req);
    return await twoFactorController.verify2FALogin(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
