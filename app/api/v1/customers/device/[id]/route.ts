import ErrorHandler from "@/app/server/controllers/error.controller";
import sessionController from "@/app/server/controllers/session.controller";
import { connectDB } from "@/app/server/db/db";
import { AuthMiddleware } from "@/app/server/middlewares/auth.middleware";

import { type NextRequest, NextResponse } from "next/server";
export const DELETE = async (
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) => {
  const params = await props.params;
  const { id } = params;
  try {
    await connectDB();
    await AuthMiddleware.requireAuth()(req);
    req.id = id;
    return await sessionController.revokeSession(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
