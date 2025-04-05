import {type NextRequest} from 'next/server';

import {UserRole} from '@/app/lib/types/users.types';
import ErrorHandler from '@/app/server/controllers/error.controller';
import productController from '@/app/server/controllers/product.controller';
import {connectDB} from '@/app/server/db/db';
import {AuthMiddleware} from '@/app/server/middlewares/auth.middleware';

export const PUT = async (
  req: NextRequest,
  props: {
    params: Promise<{slug: string}>;
  },
) => {
  const params = await props.params;
  const {slug} = params;
  try {
    await connectDB();
    await AuthMiddleware.requireAuth([UserRole.ADMIN, UserRole.MODERATOR])(req);
    req.slug = slug;
    return await productController.deleteProductImages(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
