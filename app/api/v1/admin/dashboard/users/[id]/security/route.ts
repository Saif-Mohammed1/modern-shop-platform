import { type NextRequest } from "next/server";

import { UserRole } from "@/app/lib/types/users.db.types";
import ErrorHandler from "@/app/server/controllers/error.controller";
import userController from "@/app/server/controllers/user.controller";
import { AuthMiddleware } from "@/app/server/middlewares/auth.middleware";

//  /admin/dashboard/users/[id]
export const GET = async (
  req: NextRequest,
  props: {
    params: Promise<{ id: string }>;
  }
) => {
  const params = await props.params;
  const { id } = params;
  try {
    await AuthMiddleware.requireAuth([UserRole.ADMIN])(req);
    req.id = id;
    return await userController.forceRestPassword(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
export const POST = async (
  req: NextRequest,
  props: {
    params: Promise<{ id: string }>;
  }
) => {
  const params = await props.params;
  const { id } = params;
  try {
    await AuthMiddleware.requireAuth([UserRole.ADMIN])(req);
    req.id = id;
    return await userController.revokeAllUserSessions(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
export const PUT = async (
  req: NextRequest,
  props: {
    params: Promise<{ id: string }>;
  }
) => {
  const params = await props.params;
  const { id } = params;
  try {
    await AuthMiddleware.requireAuth([UserRole.ADMIN])(req);
    req.id = id;
    return await userController.lockUserAccount(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
export const PATCH = async (
  req: NextRequest,
  props: {
    params: Promise<{ id: string }>;
  }
) => {
  const params = await props.params;
  const { id } = params;
  try {
    await AuthMiddleware.requireAuth([UserRole.ADMIN])(req);
    req.id = id;
    return await userController.unlockUserAccount(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
