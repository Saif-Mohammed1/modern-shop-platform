import {type NextRequest} from 'next/server';

import cartController from '@/app/server/controllers/cart.controller';
import ErrorHandler from '@/app/server/controllers/error.controller';
import {connectDB} from '@/app/server/db/db';
import {AuthMiddleware} from '@/app/server/middlewares/auth.middleware';

export const POST = async (req: NextRequest) => {
  try {
    await connectDB();

    await AuthMiddleware.requireAuth()(req);

    return await cartController.saveLocalCartToDB(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
