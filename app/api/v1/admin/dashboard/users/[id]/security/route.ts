import { type NextRequest } from "next/server";
import { connectDB } from "@/app/_server/db/db";
import { AuthMiddleware } from "@/app/_server/middlewares/auth.middleware";
import { UserRole } from "@/app/lib/types/users.types";
import ErrorHandler from "@/app/_server/controllers/error.controller";
import userController from "@/app/_server/controllers/user.controller";
//  /admin/dashboard/users/[id]
export const GET = async (
  req: NextRequest,
  {
    params,
  }: {
    params: { id: string };
  }
) => {
  const { id } = params;
  try {
    await connectDB();
    await AuthMiddleware.requireAuth([UserRole.ADMIN])(req);
    req.id = id;
    return await userController.forceRestPassword(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
export const POST = async (
  req: NextRequest,
  {
    params,
  }: {
    params: { id: string };
  }
) => {
  const { id } = params;
  try {
    await connectDB();
    await AuthMiddleware.requireAuth([UserRole.ADMIN])(req);
    req.id = id;
    return await userController.revokeAllUserSessions(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
export const PUT = async (
  req: NextRequest,
  {
    params,
  }: {
    params: { id: string };
  }
) => {
  const { id } = params;
  try {
    await connectDB();
    await AuthMiddleware.requireAuth([UserRole.ADMIN])(req);
    req.id = id;
    return await userController.lockUserAccount(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
export const PATCH = async (
  req: NextRequest,
  {
    params,
  }: {
    params: { id: string };
  }
) => {
  const { id } = params;
  try {
    await connectDB();
    await AuthMiddleware.requireAuth([UserRole.ADMIN])(req);
    req.id = id;
    return await userController.unlockUserAccount(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
