import {type NextRequest} from 'next/server';

import ErrorHandler from '@/app/server/controllers/error.controller';
import orderController from '@/app/server/controllers/order.controller';
import stripeController from '@/app/server/controllers/stripe.controller';
import {connectDB} from '@/app/server/db/db';
import {AuthMiddleware} from '@/app/server/middlewares/auth.middleware';

export const GET = async (req: NextRequest) => {
  try {
    await connectDB();
    await AuthMiddleware.requireAuth()(req);
    return orderController.getOrdersByUserId(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};

export const POST = async (req: NextRequest) => {
  try {
    await connectDB();

    await AuthMiddleware.requireAuth()(req);
    return await stripeController.createStripeSession(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
// export const POST = async (req: NextRequest) => {
//   try {
//     await connectDB();

//     await AuthMiddleware.requireAuth()(req);
//     const { sessionId, url, statusCode } = await createStripeProduct(req);

//     return NextResponse.json(
//       {
//         sessionId,
//         url,
//       },
//       { status: statusCode }
//     );
//   } catch (error) {
//     return ErrorHandler(error, req);
//   }
// };
