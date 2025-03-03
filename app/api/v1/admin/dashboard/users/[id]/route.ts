import ErrorHandler from "@/app/_server/controllers/error.controller";
import userController from "@/app/_server/controllers/user.controller";

import { connectDB } from "@/app/_server/db/db";
import { AuthMiddleware } from "@/app/_server/middlewares/auth.middleware";
import { UserRole } from "@/app/lib/types/users.types";
import { type NextRequest, NextResponse } from "next/server";
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
    return await userController.getUser(req);
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
    const { data, statusCode } = await updateOne<IUser>(req, User, [
      "name",
      "email",
      "role",
      "active",
    ]);

    return NextResponse.json({ data }, { status: statusCode });
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
export const DELETE = async (
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
    return await userController.deactivateAccount(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
