import {type NextRequest} from 'next/server';

import twoFactorController from '@/app/server/controllers/2fa.controller';
import ErrorHandler from '@/app/server/controllers/error.controller';
import {connectDB} from '@/app/server/db/db';
import {AuthMiddleware} from '@/app/server/middlewares/auth.middleware';

/**
1. POST /api/auth/2fa - Handles 2FA setup initialization.
1.5 Put /api/auth/2fa - Handles 2FA setup initialization.
2. POST /api/auth/2fa/verify - Verifies the TOTP token during setup.

3. POST /api/auth/2fa/disable - Disables 2FA for the user.

4. POST /api/auth/2fa/backup/verify - Verifies a backup code.

5. POST /api/auth/2fa/recovery - Regenerates backup codes.

6. GET /api/auth/2fa/audit - Fetches audit logs.
 */
// export const PUT = async (req: NextRequest) => {
//   try {
//     await connectDB();
//     return await twoFactorController.generateSessionToken(req);
//   } catch (error) {
//     return ErrorHandler(error, req);
//   }
// };
export const POST = async (req: NextRequest) => {
  try {
    await connectDB();
    await AuthMiddleware.requireAuth()(req);
    return await twoFactorController.initialize2FA(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
