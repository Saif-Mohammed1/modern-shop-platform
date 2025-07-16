import { UserRole } from "@/app/lib/types/users.db.types";
import { lang } from "@/app/lib/utilities/lang";
import { UserTranslate } from "@/public/locales/server/User.translate";

import { UserValidation } from "../../dtos/user.dto";
import { AuthMiddleware } from "../../middlewares/auth.middleware";
import { UserService } from "../../services/user.service";
import type { Context } from "../apollo-server";

const userService = new UserService();
export const userResolvers = {
  Query: {
    //   getAllUsers: async (_, __, { dataSources }) => {
    //   const users = await dataSources.userRepository.getAllUsers();
    //   return {
    //       docs: users,
    //       meta: { total: users.length },
    //       links: {},
    //   };
    //   },
  },
  Mutation: {
    deactivateAccount: async (
      _parent: unknown,
      _args: unknown,
      { req }: Context
    ) => {
      await AuthMiddleware.requireAuth([])(req);
      const user_id = String(req.user?._id);
      await userService.deactivateAccount(user_id);

      return { message: UserTranslate[lang].deactivateAccount };
    },
    deleteAccountByAdmin: async (
      _parent: unknown,
      { id }: { id: string },
      { req }: Context
    ) => {
      await AuthMiddleware.requireAuth([UserRole.ADMIN, UserRole.MODERATOR])(
        req
      );
      await userService.deleteUserByAdmin(id);

      return { message: UserTranslate[lang].deactivateAccount };
    },
    updatePassword: async (
      _parent: unknown,
      {
        input,
      }: {
        input: {
          newPassword: string;
          confirmPassword: string;
          currentPassword: string;
        };
      },
      { req }: Context
    ) => {
      await AuthMiddleware.requireAuth([])(req);
      const user_id = String(req.user?._id);
      const result = UserValidation.validateChangePassword(input);
      await userService.changePassword(user_id, result);
      return { message: UserTranslate[lang].updatePassword };
    },
  },
};
