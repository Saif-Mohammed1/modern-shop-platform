import {type NextRequest} from 'next/server';

import {UserRole} from '@/app/lib/types/users.types';
import adminDashboardController from '@/app/server/controllers/adminDashboard.controller';
import ErrorHandler from '@/app/server/controllers/error.controller';
import {connectDB} from '@/app/server/db/db';
import {AuthMiddleware} from '@/app/server/middlewares/auth.middleware';

export const GET = async (req: NextRequest) => {
  try {
    await connectDB();
    await AuthMiddleware.requireAuth([UserRole.ADMIN, UserRole.MODERATOR])(req);
    return await adminDashboardController.getDashboardData();
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
