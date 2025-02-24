import ErrorHandler from "@/app/_server/controllers/error.controller";
import sessionController from "@/app/_server/controllers/session.controller";

import { connectDB } from "@/app/_server/db/db";
import { AuthMiddleware } from "@/app/_server/middlewares/auth.middleware";
import { type NextRequest } from "next/server";
export const GET = async (req: NextRequest) => {
  try {
    await connectDB();
    return await sessionController.refreshAccessToken(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
export const DELETE = async (req: NextRequest) => {
  try {
    await connectDB();
    await AuthMiddleware.requireAuth()(req);

    return await sessionController.revokeAllUserTokens(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
