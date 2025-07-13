import type { Knex } from "knex";

import {
  AuditSource,
  type AuditAction,
  type IAuditLogChangesDB,
} from "@/app/lib/types/audit.db.types";
import type { QueryOptionConfig } from "@/app/lib/types/queryBuilder.types";
import AppError from "@/app/lib/utilities/appError";
import { lang } from "@/app/lib/utilities/lang";
import { OrderTranslate } from "@/public/locales/server/Order.Translate";

import { connectDB } from "../db/db";
import type {
  CreateOrderDto,
  UpdateOrderDto,
  // UpdateOrderDto,
  UpdateOrderStatusDto,
} from "../dtos/order.dto";
import { OrderRepository } from "../repositories/order.repository";

export class OrderService {
  constructor(
    private readonly repository: OrderRepository = new OrderRepository(
      connectDB()
    )
  ) {}
  async createOrder(dto: CreateOrderDto, trx?: Knex.Transaction) {
    // return await this.repository.transaction(async (trx) => {
    // const order =
    return await this.repository.createOrder(dto, trx);
    // return order;
    // });
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
  async getLatestOrder(user_id: string) {
    const order = await this.repository.getLatestOrder(user_id);
    if (!order) {
      throw new AppError(OrderTranslate[lang].errors.noDocumentsFound, 404);
    }
    return order;
  }
  async getOrdersByUserId(user_id: string, options: QueryOptionConfig) {
    return await this.repository.findByUser(user_id, options);
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
    return await this.repository.transaction(async (trx) => {
      const order = await this.repository.updateDetails(id, dto, trx);
      if (!order) {
        throw new AppError(OrderTranslate[lang].errors.noDocumentsFound, 404);
      }
      return order;
    });
  }

  async deleteOrder(id: string) {
    return await this.repository.delete(id);
  }
  async createAuditLog(
    action: AuditAction,
    entityId: string,
    actor: string,
    changes: Omit<IAuditLogChangesDB, "_id" | "created_at" | "audit_log_id">[],
    context: Record<string, any>,
    source: AuditSource = AuditSource.WEB,
    trx?: Knex.Transaction
  ) {
    await this.repository.logAction(
      action,
      entityId,
      actor,
      changes,
      context,
      // logs.ipAddress,
      // logs.userAgent,
      source, // Add source to LogsTypeDto
      trx
    );
  }
}
