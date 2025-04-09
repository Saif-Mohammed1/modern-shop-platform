import {type NextRequest} from 'next/server';
import {z} from 'zod';

import {UserRole, UserStatus} from '@/app/lib/types/users.types';
import AppError from '@/app/lib/utilities/appError';
import {lang} from '@/app/lib/utilities/lang';
import {authControllerTranslate} from '@/public/locales/server/authControllerTranslate';
import {commonTranslations} from '@/public/locales/server/Common.Translate';
import {errorControllerTranslate} from '@/public/locales/server/errorControllerTranslate';

import type {IUser} from '../models/User.model';
import {TokensService} from '../services/tokens.service';
import {UserService} from '../services/user.service';

const tokenSchema = z
  .string({
    message: authControllerTranslate[lang].functions.isAuth.noExistingToken,
  })
  .min(1)
  .refine((val) => val !== 'null', {
    message: authControllerTranslate[lang].functions.isAuth.noExistingToken,
  });

const validateToken = (token: string | null | undefined) => {
  // if (!token || token === "null")
  //   return { success: false, error: "No token provided", data: null };
  return tokenSchema.safeParse(token);
};

export class AuthMiddleware {
  private static userService = new UserService();
  private static tokenService = new TokensService();
  static requireAuth(roles?: UserRole[]) {
    return async (req: NextRequest) => {
      try {
        // const authHeader = req?.headers?.get("authorization")
        const token = req?.headers?.get('authorization')?.split(' ')[1] ?? undefined;
        // const token =
        //   authHeader?.startsWith("Bearer") && authHeader.split(" ")[1];
        const result = validateToken(token);

        if (!result.success || !result.data) {
          throw new AppError(authControllerTranslate[lang].functions.isAuth.noExistingToken, 401);
        }
        const decoded = await this.tokenService.decodedAccessToken(result.data);
        const user = await this.userService.findUserById(
          decoded.userId,
          // "-security"
        );
        if (!user) {throw new AppError(commonTranslations[lang].userNotExists, 404);}

        if (user.status !== UserStatus.ACTIVE) {
          throw new AppError(commonTranslations[lang].userSuspended, 403);
        }

        if (roles && roles.length > 0) {
          await this.enforceRole(roles, user);
        }

        req.user = user;
      } catch (error) {
        if (error instanceof Error && error.name === 'handleJWTExpiredError')
          {throw new AppError(
            errorControllerTranslate[lang].controllers['handleJWTExpiredError'].message,
            401,
          );}
        throw error;
      }
    };
  }

  private static async enforceRole(roles: UserRole[], user: IUser) {
    if (!roles.includes(user.role)) {
      throw new AppError(commonTranslations[lang].noPermission, 403);
    }
  }

  static async checkPermissions(
    user: IUser, //resource: string
    action: string,
  ) {
    // Implement your permission logic here
    // Example: Check against role-based permissions matrix
    const permissions = {
      [UserRole.ADMIN]: ['create', 'read', 'update', 'delete'],
      [UserRole.MODERATOR]: ['read', 'update'],
      [UserRole.CUSTOMER]: ['read'],
    };

    if (!permissions[user.role].includes(action)) {
      throw new AppError(commonTranslations[lang].unauthorizedAction, 403);
    }
  }
}
