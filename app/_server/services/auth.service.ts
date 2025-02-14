import { NextRequest } from "next/server";
import { UserService } from "./user.service";
import { IUser, UserRole, UserStatus } from "../models/User.model";
import AppError from "@/app/lib/utilities/appError";
import { authControllerTranslate } from "@/public/locales/server/authControllerTranslate";
import { lang } from "@/app/lib/utilities/lang";
import { promisify } from "util";
import jwt from "jsonwebtoken";
export class AuthService {
  private static userService = new UserService();

  static requireAuth(roles?: UserRole[]) {
    return async (req: NextRequest) => {
      const authHeader = req?.headers?.get("authorization");
      const token =
        authHeader?.startsWith("Bearer") && authHeader.split(" ")[1];
      if (!token) {
        throw new AppError(
          authControllerTranslate[lang].functions.isAuth.noExistingToken,
          401
        );
      }

      const decoded = (await promisify<string, jwt.Secret>(jwt.verify)(
        token,
        process.env.JWT_ACCESS_TOKEN_SECRET!
      )) as unknown as { userId: string };
      const user = await this.userService.findUserById(decoded.userId);

      if (!user) throw new AppError("User no longer exists", 401);

      if (user.status !== UserStatus.ACTIVE) {
        throw new AppError("Your account has been suspended", 403);
      }

      if (roles && roles.length > 0) {
        await this.enforceRole(roles, user);
      }

      req.user = user;
    };
  }

  private static async enforceRole(roles: UserRole[], user: IUser) {
    if (!roles.includes(user.role)) {
      throw new AppError(
        "You do not have permission to access this resource",
        403
      );
    }
  }

  static async checkPermissions(
    user: IUser, //resource: string
    action: string
  ) {
    // Implement your permission logic here
    // Example: Check against role-based permissions matrix
    const permissions = {
      [UserRole.ADMIN]: ["create", "read", "update", "delete"],
      [UserRole.MODERATOR]: ["read", "update"],
      [UserRole.CUSTOMER]: ["read"],
    };

    if (!permissions[user.role].includes(action)) {
      throw new AppError("Unauthorized action", 403);
    }
  }
}
