import {type NextRequest} from 'next/server';

import {UserRole} from '@/app/lib/types/users.types';
import ErrorHandler from '@/app/server/controllers/error.controller';
import userController from '@/app/server/controllers/user.controller';
import {connectDB} from '@/app/server/db/db';
import {AuthMiddleware} from '@/app/server/middlewares/auth.middleware';

export const GET = async (req: NextRequest) => {
  try {
    await connectDB();
    await AuthMiddleware.requireAuth([UserRole.ADMIN, UserRole.MODERATOR])(req);
    return await userController.getAllUsers(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};

export const POST = async (req: NextRequest) => {
  try {
    await connectDB();
    await AuthMiddleware.requireAuth([UserRole.ADMIN])(req);
    req.id = String(req.user?._id);
    return await userController.createUserByAdmin(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
