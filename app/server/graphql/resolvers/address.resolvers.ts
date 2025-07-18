import { lang } from "@/app/lib/utilities/lang";
import { AddressTranslate } from "@/public/locales/server/Address.Translate";

import {
  AddressValidation,
  type CreateAddressDtoType,
  type UpdateAddressDtoType,
} from "../../dtos/address.dto";
import { AuthMiddleware } from "../../middlewares/auth.middleware";
import { AddressService } from "../../services/address.service";
import type { Context } from "../apollo-server";

const addressService = new AddressService();
export const addressResolvers = {
  Query: {
    getMyAddress: async (
      _parent: unknown,
      {
        filter = {},
      }: {
        filter: {
          page?: number;
          limit?: number;
        };
      },
      { req }: Context
    ) => {
      await AuthMiddleware.requireAuth([])(req);
      const user_id = String(req.user?._id);
      const query = new URLSearchParams();

      if (filter.page) {
        query.append("page", String(filter.page));
      }
      if (filter.limit) {
        query.append("limit", String(filter.limit));
      }
      const result = await addressService.getUserAddress(user_id, {
        query,

        populate: true,
      });
      return result;
    },
  },
  Mutation: {
    addAddress: async (
      _parent: unknown,
      { input }: { input: Omit<CreateAddressDtoType, "user_id"> },
      { req }: Context
    ) => {
      await AuthMiddleware.requireAuth([])(req);
      const user_id = String(req.user?._id);

      const result = AddressValidation.validateCreateAddress({
        ...input,
        user_id,
      });
      const address = await addressService.create(result);
      return address;
    },
    deleteMyAddress: async (
      _parent: unknown,
      { id }: { id: string },
      { req }: Context
    ) => {
      await AuthMiddleware.requireAuth([])(req);
      const user_id = String(req.user?._id);
      const result = AddressValidation.validateId({
        id,

        user_id,
      });
      await addressService.deleteMyAddress(
        String(result.id),
        String(result.user_id)
      );

      return { message: AddressTranslate[lang].delete.success };
    },
    updateMyAddress: async (
      _parent: unknown,
      {
        id,
        input,
      }: { id: string; input: Omit<UpdateAddressDtoType, "user_id"> },
      { req }: Context
    ) => {
      await AuthMiddleware.requireAuth([])(req);
      const user_id = String(req.user?._id);
      const result = AddressValidation.validateUpdateAddress({
        ...input,
        user_id,
      });
      const address = await addressService.updateAddress(id, result);
      return address;
    },
  },
};
