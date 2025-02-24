import ErrorHandler from "@/app/_server/controllers/error.controller";
import userController from "@/app/_server/controllers/user.controller";
import { connectDB } from "@/app/_server/db/db";
import { AuthMiddleware } from "@/app/_server/middlewares/auth.middleware";
import { type NextRequest } from "next/server";

export const DELETE = async (req: NextRequest) => {
  try {
    await connectDB();
    await AuthMiddleware.requireAuth()(req);
    req.id = String(req.user?._id);
    return userController.deactivateAccount(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
