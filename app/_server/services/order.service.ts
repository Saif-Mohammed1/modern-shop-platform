import { QueryOptionConfig } from "@/app/lib/types/queryBuilder.types";
import {
  CreateOrderDto,
  UpdateOrderDto,
  UpdateOrderStatusDto,
} from "../dtos/order.dto";
import OrderModel from "../models/Order.model ";
import { OrderRepository } from "../repositories/order.repository";

export class OrderService {
  private repository = new OrderRepository(OrderModel);

  async createOrder(dto: CreateOrderDto) {
    const session = await this.repository.startSession();
    session.startTransaction();

    try {
      await this.repository.create(dto, session);
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async getOrders(options: QueryOptionConfig) {
    return await this.repository.getOrders(options);
  }

  async getOrderById(id: string) {
    return this.repository.findById(id);
  }
  async getLatestOrder(userId: string) {
    return this.repository.getLatestOrder(userId);
  }
  async getOrdersByUserId(userId: string, options: QueryOptionConfig) {
    return this.repository.findByUser(userId, options);
  }
  async updateOrderStatus(orderId: string, status: UpdateOrderStatusDto) {
    return this.repository.updateStatus(orderId, status);
  }
  async updateOrder(id: string, dto: UpdateOrderDto) {
    const session = await this.repository.startSession();
    session.startTransaction();
    try {
      await this.repository.update(id, dto, session);

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async deleteOrder(id: string) {
    return this.repository.delete(id);
  }
}
