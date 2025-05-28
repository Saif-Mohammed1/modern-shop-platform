import { type NextRequest } from "next/server";

import ErrorHandler from "@/app/server/controllers/error.controller";
import sessionController from "@/app/server/controllers/session.controller";
import { AuthMiddleware } from "@/app/server/middlewares/auth.middleware";

export const GET = async (req: NextRequest) => {
  try {
    return await sessionController.refreshAccessToken(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
export const DELETE = async (req: NextRequest) => {
  try {
    await AuthMiddleware.requireAuth()(req);

    return await sessionController.revokeAllUserTokens(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
