import {type NextRequest} from 'next/server';

import addressController from '@/app/server/controllers/address.controller';
import ErrorHandler from '@/app/server/controllers/error.controller';
import {connectDB} from '@/app/server/db/db';
import {AuthMiddleware} from '@/app/server/middlewares/auth.middleware';

export const PATCH = async (
  req: NextRequest,
  props: {
    params: Promise<{id: string}>;
  },
) => {
  const params = await props.params;
  const {id} = params;
  try {
    await connectDB();
    await AuthMiddleware.requireAuth()(req);
    req.id = id;
    // const { data, statusCode } = await updateOne<IAddressSchema>(req, Address, [
    //   "street",
    //   "city",
    //   "state",
    //   "postalCode",
    //   "country",
    //   "phone",
    // ]);

    return await addressController.updateMyAddress(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};

export const DELETE = async (
  req: NextRequest,
  props: {
    params: Promise<{id: string}>;
  },
) => {
  const params = await props.params;
  const {id} = params;
  try {
    await connectDB();
    await AuthMiddleware.requireAuth()(req);
    req.id = id;
    return await addressController.deleteMyAddress(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
