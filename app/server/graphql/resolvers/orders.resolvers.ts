import { UserRole } from "@/app/lib/types/users.db.types";
import { lang } from "@/app/lib/utilities/lang";
import { OrderTranslate } from "@/public/locales/server/Order.Translate";

import { OrderValidation, type CreateOrderDto } from "../../dtos/order.dto";
import { AuthMiddleware } from "../../middlewares/auth.middleware";
import { OrderService } from "../../services/order.service";
import type { Context } from "../apollo-server";

const orderService = new OrderService();
interface OrderFilter {
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

      query.append("page", page.toString());
      query.append("limit", limit.toString());
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
      const order = await orderService.getOrderById(id);
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

      query.append("page", page.toString());
      query.append("limit", limit.toString());
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
      const dto = OrderValidation.validateUpdateOrderStatus({ status });
      const order = await orderService.updateOrderStatus(id, dto.status);
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
      const user_id = String(req.user?._id);
      const dto = OrderValidation.validateUpdateOrder({ ...input, user_id });
      const order = await orderService.updateOrder(id, dto);
      return order;
    },
    deleteOrder: async (
      _parent: unknown,
      { id }: { id: string },
      { req }: Context
    ) => {
      await AuthMiddleware.requireAuth([UserRole.ADMIN])(req);
      await orderService.deleteOrder(id);
      return { message: OrderTranslate[lang].functions.delete.success };
    },
  },
};
