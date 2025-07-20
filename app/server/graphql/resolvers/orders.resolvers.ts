import { UserRole } from "@/app/lib/types/users.db.types";
import { lang } from "@/app/lib/utilities/lang";
import { OrderTranslate } from "@/public/locales/server/Order.Translate";

import { OrderValidation, type CreateOrderDto } from "../../dtos/order.dto";
import { StripeValidation } from "../../dtos/stripe.dto";
import { AuthMiddleware } from "../../middlewares/auth.middleware";
import { OrderService } from "../../services/order.service";
import { StripeService } from "../../services/stripe.service";
import { GlobalFilterValidator } from "../../validators/global-filter.validator";
import type { Context } from "../apollo-server";

const stripeService = new StripeService();
const orderService = new OrderService();
interface OrderFilter {
  page?: number;
  limit?: number;
}
interface AdminOrderFilter {
  email?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  sort?: string;
  page?: number;
  limit?: number;
}
export const ordersResolvers = {
  Query: {
    getOrders: async (
      _parent: unknown,
      { filter }: { filter?: OrderFilter },
      { req }: Context
    ) => {
      await AuthMiddleware.requireAuth([UserRole.ADMIN, UserRole.MODERATOR])(
        req
      );
      const { page = 1, limit = 10 } = filter || {}; // Add default empty object
      const query = new URLSearchParams();
      const dto = GlobalFilterValidator.validate({
        page,
        limit,
      });
      if (dto.page) {
        query.append("page", dto.page.toString());
      }
      if (dto.limit) {
        query.append("limit", dto.limit.toString());
      }
      const orders = await orderService.getOrders({
        query,
        populate: true,
      });
      return orders;
    },
    getOrdersByAdmin: async (
      _parent: unknown,
      { filter }: { filter?: AdminOrderFilter },
      { req }: Context
    ) => {
      await AuthMiddleware.requireAuth([UserRole.ADMIN, UserRole.MODERATOR])(
        req
      );

      const { page = 1, limit = 10 } = filter || {}; // Add default empty object
      const query = new URLSearchParams();

      const dto = GlobalFilterValidator.validate({
        ...filter,
        page,
        limit,
      });
      if (dto.page) {
        query.append("page", dto.page.toString());
      }
      if (dto.limit) {
        query.append("limit", dto.limit.toString());
      }
      if (dto.email) {
        query.append("email", dto.email);
      }
      if (dto.status) {
        query.append("status", dto.status);
      }
      if (dto.startDate) {
        query.append("created_at[gte]", dto.startDate);
      }
      if (dto.endDate) {
        query.append("created_at[lte]", dto.endDate);
      }
      if (dto.sort) {
        query.append("sort", dto.sort);
      }
      const orders = await orderService.getOrders({
        query,
        populate: true,
      });
      return orders;
    },
    getOrderById: async (
      _parent: unknown,
      { id }: { id: string },
      { req }: Context
    ) => {
      await AuthMiddleware.requireAuth([UserRole.ADMIN, UserRole.MODERATOR])(
        req
      );

      // Validate ID format
      const validatedId = GlobalFilterValidator.validateId(id);

      const order = await orderService.getOrderById(validatedId);
      return order;
    },
    getOrdersByUserId: async (
      _parent: unknown,
      { filter }: { filter?: OrderFilter },
      { req }: Context
    ) => {
      await AuthMiddleware.requireAuth()(req);
      const user_id = String(req.user?._id);
      const { page = 1, limit = 10 } = filter || {}; // Add default empty object
      const query = new URLSearchParams();

      const dto = GlobalFilterValidator.validate({
        page,
        limit,
      });
      if (dto.page) {
        query.append("page", dto.page.toString());
      }
      if (dto.limit) {
        query.append("limit", dto.limit.toString());
      }

      const orders = await orderService.getOrdersByUserId(user_id, {
        query,
        populate: true,
      });
      return orders;
    },
    getLatestOrder: async (
      _parent: unknown,
      _args: unknown,
      { req }: Context
    ) => {
      await AuthMiddleware.requireAuth()(req);
      const user_id = String(req.user?._id);
      const order = await orderService.getLatestOrder(user_id);
      return order;
    },
  },
  Mutation: {
    createOrder: async (
      _parent: unknown,
      { input }: { input: Omit<CreateOrderDto, "user_id"> },
      { req }: Context
    ) => {
      await AuthMiddleware.requireAuth([UserRole.MODERATOR, UserRole.ADMIN])(
        req
      );
      const user_id = String(req.user?._id);
      const dto = OrderValidation.validateCreateOrder({ ...input, user_id });
      const order = await orderService.createOrder(dto);
      return order;
    },
    updateOrderStatus: async (
      _parent: unknown,
      { id, status }: { id: string; status: string },
      { req }: Context
    ) => {
      await AuthMiddleware.requireAuth([UserRole.ADMIN, UserRole.MODERATOR])(
        req
      );

      // Validate ID format
      const validatedId = GlobalFilterValidator.validateId(id);

      const dto = OrderValidation.validateUpdateOrderStatus({ status });
      const order = await orderService.updateOrderStatus(
        validatedId,
        dto.status
      );
      return order;
    },
    updateOrder: async (
      _parent: unknown,
      { id, input }: { id: string; input: Omit<CreateOrderDto, "user_id"> },
      { req }: Context
    ) => {
      await AuthMiddleware.requireAuth([UserRole.ADMIN, UserRole.MODERATOR])(
        req
      );

      // Validate ID format
      const validatedId = GlobalFilterValidator.validateId(id);

      const user_id = String(req.user?._id);
      const dto = OrderValidation.validateUpdateOrder({ ...input, user_id });
      const order = await orderService.updateOrder(validatedId, dto);
      return order;
    },
    deleteOrder: async (
      _parent: unknown,
      { id }: { id: string },
      { req }: Context
    ) => {
      await AuthMiddleware.requireAuth([UserRole.ADMIN])(req);

      // Validate ID format
      const validatedId = GlobalFilterValidator.validateId(id);

      await orderService.deleteOrder(validatedId);
      return { message: OrderTranslate[lang].functions.delete.success };
    },

    createCheckoutSession: async (
      _parent: unknown,
      {
        input,
      }: {
        input: {
          shipping_info: {
            street: string;
            city: string;
            state: string;
            postal_code: string;
            phone: string;
            country: string;
          };
        };
      },
      { req }: Context
    ) => {
      await AuthMiddleware.requireAuth([])(req);
      const result = StripeValidation.validateShippingInfo(input.shipping_info);
      const session = await stripeService.createStripeSession(
        req.user!,
        result
        // logs
      );
      return session;
    },
  },
};
