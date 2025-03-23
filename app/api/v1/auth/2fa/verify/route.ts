import { type NextRequest } from "next/server";
import { connectDB } from "@/app/server/db/db";
import { AuthMiddleware } from "@/app/server/middlewares/auth.middleware";
import ErrorHandler from "@/app/server/controllers/error.controller";
import twoFactorController from "@/app/server/controllers/2fa.controller";

export const POST = async (req: NextRequest) => {
  try {
    await connectDB();
    await AuthMiddleware.requireAuth()(req);
    return await twoFactorController.verify2FA(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
export const PUT = async (req: NextRequest) => {
  try {
    await connectDB();
    // await isAuth(req);
    return await twoFactorController.verify2FALogin(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
