import {type NextRequest} from 'next/server';

import {UserRole} from '@/app/lib/types/users.types';
import ErrorHandler from '@/app/server/controllers/error.controller';
import orderController from '@/app/server/controllers/order.controller';
import {connectDB} from '@/app/server/db/db';
import {AuthMiddleware} from '@/app/server/middlewares/auth.middleware';

export const GET = async (req: NextRequest) => {
  try {
    await connectDB();
    await AuthMiddleware.requireAuth([UserRole.ADMIN, UserRole.MODERATOR])(req);
    return await orderController.getOrders(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
