import {type NextRequest} from 'next/server';

import authController from '@/app/server/controllers/auth.controller';
import ErrorHandler from '@/app/server/controllers/error.controller';
import {connectDB} from '@/app/server/db/db';

export const GET = async (req: NextRequest) => {
  try {
    await connectDB();
    return await authController.isEmailAndTokenValid(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
export const POST = async (req: NextRequest) => {
  try {
    await connectDB();

    return await authController.resetPassword(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
