import type { QueryOptionConfig } from "@/app/lib/types/queryBuilder.types";
import type {
  CreateOrderDto,
  UpdateOrderDto,
  UpdateOrderStatusDto,
} from "../dtos/order.dto";
import OrderModel from "../models/Order.model";
import { OrderRepository } from "../repositories/order.repository";
import AppError from "@/app/lib/utilities/appError";
import { OrderTranslate } from "@/public/locales/server/Order.Translate";
import { lang } from "@/app/lib/utilities/lang";

export class OrderService {
  constructor(
    private readonly repository: OrderRepository = new OrderRepository(
      OrderModel
    )
  ) {}
  async createOrder(dto: CreateOrderDto) {
    const session = await this.repository.startSession();
    session.startTransaction();

    try {
      const order = await this.repository.create(dto, session);
      await session.commitTransaction();
      return order;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async getOrders(options: QueryOptionConfig) {
    return (await this.repository.getOrders(options)) || [];
  }

  async getOrderById(id: string) {
    const order = await this.repository.findById(id);
    if (!order) {
      throw new AppError(OrderTranslate[lang].errors.noDocumentsFound, 404);
    }
    return order;
  }
  async getLatestOrder(userId: string) {
    const order = await this.repository.getLatestOrder(userId);
    if (!order) {
      throw new AppError(OrderTranslate[lang].errors.noDocumentsFound, 404);
    }
    return order;
  }
  async getOrdersByUserId(userId: string, options: QueryOptionConfig) {
    return await this.repository.findByUser(userId, options);
  }
  async updateOrderStatus(
    orderId: string,

    status: UpdateOrderStatusDto["status"]
  ) {
    const order = await this.repository.updateStatus(orderId, status);
    if (!order) {
      throw new AppError(OrderTranslate[lang].errors.noDocumentsFound, 404);
    }
    return order;
  }
  async updateOrder(id: string, dto: UpdateOrderDto) {
    const session = await this.repository.startSession();
    session.startTransaction();
    try {
      const order = await this.repository.update(id, dto, session);
      if (!order) {
        throw new AppError(OrderTranslate[lang].errors.noDocumentsFound, 404);
      }

      await session.commitTransaction();
      return order;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async deleteOrder(id: string) {
    return await this.repository.delete(id);
  }
}
