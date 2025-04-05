// export const dynamic = "force-static";
// export const revalidate = 600;
// export const revalidate = 60 * 10; //doesn't work ; //doesn't work
import {type NextRequest} from 'next/server';

import ErrorHandler from '@/app/server/controllers/error.controller';
import productController from '@/app/server/controllers/product.controller';
import {connectDB} from '@/app/server/db/db';

export const GET = async (
  req: NextRequest,
  props: {
    params: Promise<{slug: string}>;
  },
) => {
  const params = await props.params;
  const {slug} = params;
  try {
    await connectDB();
    req.slug = slug;
    return await productController.getProductBySlug(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
