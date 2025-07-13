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
    return await userController.getUser(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};

// export const PUT = async (
//   req: NextRequest,
//   {
//     params,
//   }: {
//     params: { id: string };
//   }
// ) => {
//   const { id } = params;
//   try {
//
//     await AuthMiddleware.requireAuth([UserRole.ADMIN])(req);

//     req.id = id;
//     return await userController.updateUserByAdmin(req);
//     // const { data, statusCode } = await updateOne<IUser>(req, User, [
//     //   "name",
//     //   "email",
//     //   "role",
//     //   "active",
//     // ]);
//   } catch (error) {
//     return ErrorHandler(error, req);
//   }
// };
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
    return await userController.updateUserByAdmin(req);
    // const { data, statusCode } = await updateOne<IUser>(req, User, [
    //   "name",
    //   "email",
    //   "role",
    //   "active",
    // ]);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
export const DELETE = async (
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
    return await userController.deleteAccountByAdmin(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
