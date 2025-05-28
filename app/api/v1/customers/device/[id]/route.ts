import { type NextRequest } from "next/server";

import ErrorHandler from "@/app/server/controllers/error.controller";
import sessionController from "@/app/server/controllers/session.controller";
import { AuthMiddleware } from "@/app/server/middlewares/auth.middleware";

export const DELETE = async (
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) => {
  const params = await props.params;
  const { id } = params;
  try {
    await AuthMiddleware.requireAuth()(req);
    req.id = id;
    return await sessionController.revokeSession(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
