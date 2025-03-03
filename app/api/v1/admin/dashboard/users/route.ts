import ErrorHandler from "@/app/_server/controllers/error.controller";
import userController from "@/app/_server/controllers/user.controller";
import { createUserByAdmin } from "@/app/_server/controllers/userController";
import { connectDB } from "@/app/_server/db/db";
import { AuthMiddleware } from "@/app/_server/middlewares/auth.middleware";
import { UserRole } from "@/app/lib/types/users.types";
import { type NextRequest } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    await connectDB();
    await AuthMiddleware.requireAuth([UserRole.ADMIN, UserRole.MODERATOR])(req);
    return await userController.getAllUsers(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};

export const POST = async (req: NextRequest) => {
  try {
    await connectDB();
    await AuthMiddleware.requireAuth([UserRole.ADMIN])(req);
    req.id = String(req.user?._id);
    return await userController.createUserByAdmin(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
