import { type NextRequest } from "next/server";
import { connectDB } from "@/app/server/db/db";
import { AuthMiddleware } from "@/app/server/middlewares/auth.middleware";
import ErrorHandler from "@/app/server/controllers/error.controller";
import twoFactorController from "@/app/server/controllers/2fa.controller";

export const POST = async (req: NextRequest) => {
  try {
    await connectDB();
    await AuthMiddleware.requireAuth()(req);
    return await twoFactorController.regenerateBackupCodes(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
