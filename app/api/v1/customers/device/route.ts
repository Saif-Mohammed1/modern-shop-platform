import { type NextRequest } from "next/server";
import { connectDB } from "@/app/server/db/db";
import { AuthMiddleware } from "@/app/server/middlewares/auth.middleware";
import ErrorHandler from "@/app/server/controllers/error.controller";
import authController from "@/app/server/controllers/auth.controller";
// /api/customers/device-info
export const GET = async (req: NextRequest) => {
  try {
    await connectDB();
    await AuthMiddleware.requireAuth()(req);
    return await authController.getActiveSessions(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
