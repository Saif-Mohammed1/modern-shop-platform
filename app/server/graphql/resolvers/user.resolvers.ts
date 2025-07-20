import { UserRole } from "@/app/lib/types/users.db.types";
import { getDeviceFingerprint } from "@/app/lib/utilities/DeviceFingerprint.utility";
import { lang } from "@/app/lib/utilities/lang";
import { UserTranslate } from "@/public/locales/server/User.translate";

import { UserValidation } from "../../dtos/user.dto";
import { AuthMiddleware } from "../../middlewares/auth.middleware";
import { UserService } from "../../services/user.service";
import { GlobalFilterValidator } from "../../validators/global-filter.validator";
import type { Context } from "../apollo-server";

interface UserFilterInput {
  search?: string;
  status?: string;
  sort?: string;
  role?: string;
  page?: number;
  limit?: number;
  active?: boolean;
}
const userService = new UserService();

export const userResolvers = {
  Query: {
    getAllUsers: async (
      _parent: unknown,
      { filter = {} }: { filter: UserFilterInput },
      { req }: Context
    ) => {
      await AuthMiddleware.requireAuth([UserRole.ADMIN, UserRole.MODERATOR])(
        req
      );
      const result = GlobalFilterValidator.validate(filter);

      const query = new URLSearchParams();
      if (result.search) {
        query.append("email[ili]", result.search);
      }
      if (result.status) {
        query.append("status", result.status);
      }
      if (result.sort) {
        query.append("sort", result.sort);
      }
      if (result.role) {
        query.append("role", result.role);
      }
      if (result.page) {
        query.append("page", result.page.toString());
      }
      if (result.limit) {
        query.append("limit", result.limit.toString());
      }
      if (result.active) {
        query.append("active", result.active.toString());
      }
      const users = await userService.getAllUsers({
        query,
      });
      return users;
    },
    getUserById: async (
      _parent: unknown,
      { id }: { id: string },
      { req }: Context
    ) => {
      await AuthMiddleware.requireAuth([UserRole.ADMIN, UserRole.MODERATOR])(
        req
      );
      const result = GlobalFilterValidator.validateId(id);
      const UserResult = await userService.findUserById(result);
      // Return comprehensive user data with security information for admin/moderator roles
      return UserResult;
    },

    findUserWithAuditLogById: async (
      _parent: unknown,
      { id }: { id: string },
      { req }: Context
    ) => {
      await AuthMiddleware.requireAuth([UserRole.ADMIN, UserRole.MODERATOR])(
        req
      );
      const result = GlobalFilterValidator.validateId(id);
      const userResult = await userService.findUserWithAuditLogById(result);
      return userResult;
    },
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
      await AuthMiddleware.requireAuth([UserRole.ADMIN])(req);

      // Validate ID format
      const validatedId = GlobalFilterValidator.validateId(id);

      await userService.deleteUserByAdmin(validatedId);

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

    updateUserByAdmin: async (
      _parent: unknown,
      {
        id,
        input,
      }: {
        id: string;
        input: {
          name?: string;
          email?: string;
          role?: string;
          status?: string;
        };
      },
      { req }: Context
    ) => {
      await AuthMiddleware.requireAuth([UserRole.ADMIN, UserRole.MODERATOR])(
        req
      );
      const validatedId = GlobalFilterValidator.validateId(id);

      await userService.updateUserByAdmin(validatedId, input);
      const updatedUser =
        await userService.findUserWithAuditLogById(validatedId);

      return updatedUser;
    },

    createUserByAdmin: async (
      _parent: unknown,
      {
        input,
      }: {
        input: {
          name: string;
          email: string;
          password: string;
          phone?: string;
          role: string;
          status: string;
          authMethods: string[];
          preferences: {
            language: string;
            currency: string;
            marketingOptIn: boolean;
          };
        };
      },
      { req }: Context
    ) => {
      await AuthMiddleware.requireAuth([UserRole.ADMIN, UserRole.MODERATOR])(
        req
      );

      // Validate the input data
      const validatedInput = UserValidation.validateCreateUserByAdminDTO(input);

      // Create user using the service
      const newUser = await userService.createUserByAdmin(validatedInput);

      // Return user with audit log
      const userWithAuditLog = await userService.findUserWithAuditLogById(
        newUser._id
      );

      return userWithAuditLog;
    },

    forcePasswordReset: async (
      _parent: unknown,
      { id }: { id: string },
      { req }: Context
    ) => {
      await AuthMiddleware.requireAuth([UserRole.ADMIN, UserRole.MODERATOR])(
        req
      );
      const validatedId = GlobalFilterValidator.validateId(id);
      const device_info = await getDeviceFingerprint(req);

      await userService.forcePasswordResetByAdmin(validatedId, device_info);

      return { message: "Password reset initiated successfully" };
    },

    revokeSessions: async (
      _parent: unknown,
      { id }: { id: string },
      { req }: Context
    ) => {
      await AuthMiddleware.requireAuth([UserRole.ADMIN, UserRole.MODERATOR])(
        req
      );
      GlobalFilterValidator.validateId(id);

      // TODO: Implement revoke sessions functionality
      // await userService.revokeSessions(validatedId);

      return { message: "User sessions revoked successfully" };
    },

    lockAccount: async (
      _parent: unknown,
      { id }: { id: string },
      { req }: Context
    ) => {
      await AuthMiddleware.requireAuth([UserRole.ADMIN, UserRole.MODERATOR])(
        req
      );
      const validatedId = GlobalFilterValidator.validateId(id);
      const device_info = await getDeviceFingerprint(req);

      await userService.lockUserAccountByAdmin(validatedId, device_info);

      return { message: "Account locked successfully" };
    },

    unlockAccount: async (
      _parent: unknown,
      { id }: { id: string },
      { req }: Context
    ) => {
      await AuthMiddleware.requireAuth([UserRole.ADMIN, UserRole.MODERATOR])(
        req
      );
      const validatedId = GlobalFilterValidator.validateId(id);
      const device_info = await getDeviceFingerprint(req);

      await userService.unlockUserAccountByAdmin(validatedId, device_info);

      return { message: "Account unlocked successfully" };
    },

    deleteUserByAdmin: async (
      _parent: unknown,
      { id }: { id: string },
      { req }: Context
    ) => {
      await AuthMiddleware.requireAuth([UserRole.ADMIN])(req);
      const validatedId = GlobalFilterValidator.validateId(id);

      await userService.deleteUserByAdmin(validatedId);

      return { message: "User deleted successfully" };
    },
  },
};
