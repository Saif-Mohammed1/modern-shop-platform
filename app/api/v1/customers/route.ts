import {type NextRequest} from 'next/server';

import ErrorHandler from '@/app/server/controllers/error.controller';
import userController from '@/app/server/controllers/user.controller';
import {connectDB} from '@/app/server/db/db';
import {AuthMiddleware} from '@/app/server/middlewares/auth.middleware';

export const DELETE = async (req: NextRequest) => {
  try {
    await connectDB();
    await AuthMiddleware.requireAuth()(req);
    req.id = String(req.user?._id);
    return userController.deactivateAccount(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
