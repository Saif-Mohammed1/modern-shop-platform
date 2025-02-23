import ErrorHandler from "@/app/_server/controllers/errorController";
import { connectDB } from "@/app/_server/db/db";
import { AuthMiddleware } from "@/app/_server/middlewares/auth.middleware";
import { type NextRequest } from "next/server";
import twoFactorController from "@/app/_server/controllers/2fa.controller";

export const POST = async (req: NextRequest) => {
  try {
    await connectDB();
    await AuthMiddleware.requireAuth()(req);
    return await twoFactorController.regenerateBackupCodes(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
