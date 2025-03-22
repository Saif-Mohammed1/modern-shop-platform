import { type NextRequest } from "next/server";
import { connectDB } from "@/app/_server/db/db";
import { AuthMiddleware } from "@/app/_server/middlewares/auth.middleware";
import { UserRole } from "@/app/lib/types/users.types";
import adminDashboardController from "@/app/_server/controllers/adminDashboard.controller";
import ErrorHandler from "@/app/_server/controllers/error.controller";

export const GET = async (req: NextRequest) => {
  try {
    await connectDB();
    await AuthMiddleware.requireAuth([UserRole.ADMIN, UserRole.MODERATOR])(req);
    return await adminDashboardController.getDashboardData();
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
