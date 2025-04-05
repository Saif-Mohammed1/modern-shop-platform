import {type NextRequest} from 'next/server';

import twoFactorController from '@/app/server/controllers/2fa.controller';
import ErrorHandler from '@/app/server/controllers/error.controller';
import {connectDB} from '@/app/server/db/db';
import {AuthMiddleware} from '@/app/server/middlewares/auth.middleware';

export const POST = async (req: NextRequest) => {
  try {
    await connectDB();
    await AuthMiddleware.requireAuth()(req);
    return await twoFactorController.disable2FA(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
