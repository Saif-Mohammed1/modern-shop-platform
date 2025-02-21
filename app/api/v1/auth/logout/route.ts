import authController from "@/app/_server/controllers/auth.controller";
import ErrorHandler from "@/app/_server/controllers/errorController";
import { connectDB } from "@/app/_server/db/db";
import { AuthService } from "@/app/_server/middlewares/auth.middleware";
import { type NextRequest } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    await connectDB();
    await AuthService.requireAuth()(req);
    return await authController.logout(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
