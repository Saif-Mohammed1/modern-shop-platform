import { type NextRequest } from "next/server";
import { connectDB } from "@/app/_server/db/db";
import { AuthMiddleware } from "@/app/_server/middlewares/auth.middleware";
import authController from "@/app/_server/controllers/auth.controller";
import ErrorHandler from "@/app/_server/controllers/error.controller";

export const POST = async (req: NextRequest) => {
  try {
    await connectDB();
    await AuthMiddleware.requireAuth()(req);
    return await authController.logout(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
