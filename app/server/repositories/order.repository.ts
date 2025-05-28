// src/repositories/order.repository.ts

import type { Knex } from "knex";

import {
  AuditSource,
  EntityType,
  type IAuditLogChangesDB,
  type IGAuditLogDB,
  type AuditAction,
} from "@/app/lib/types/audit.db.types";
import type {
  IOrderDB,
  IOrderItemDB,
  IOrderShippingAddressDB,
  OrderStatus,
} from "@/app/lib/types/orders.db.types";
import type {
  QueryBuilderConfig,
  QueryBuilderResult,
  QueryOptionConfig,
} from "@/app/lib/types/queryBuilder.types";
import { generateUUID } from "@/app/lib/utilities/id";
import { QueryBuilder } from "@/app/lib/utilities/queryBuilder";

import type {
  CreateOrderDto,
  UpdateOrderDto,
  // UpdateOrderDto,
  UpdateOrderStatusDto,
} from "../dtos/order.dto";

import { BaseRepository } from "./BaseRepository";

export class OrderRepository extends BaseRepository<IOrderDB> {
  constructor(knex: Knex) {
    super(knex, "orders");
  }
  async createOrder(
    dto: CreateOrderDto,
    trx?: Knex.Transaction
  ): Promise<IOrderDB> {
    const orderId = generateUUID();
    const query = trx ?? this.knex;
    const orderData: Omit<IOrderDB, "created_at" | "updated_at"> = {
      _id: orderId,
      user_id: dto.user_id,
      currency: dto.currency,
      invoice_id: dto.invoice_id,
      invoice_link: dto.invoice_link,
      payment: {
        method: dto.payment.method,
        transaction_id: dto.payment.transaction_id,
      },

      status: dto.status as OrderStatus,
      subtotal: dto.subtotal,
      total: dto.total,
      tax: dto.tax,
    };
    const orderItems: IOrderItemDB[] = dto.items.map((item) => ({
      _id: generateUUID(),
      order_id: orderId,
      discount: item.discount,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
      name: item.name,
      sku: item.sku,
      final_price: item.final_price,
      shipping_info_weight: item.shipping_info.weight,
      shipping_info_dimensions: {
        length: item.shipping_info.dimensions.length,
        width: item.shipping_info.dimensions.width,
        height: item.shipping_info.dimensions.height,
      },
    }));
    // Ensure dto.shipping_address is properly typed
    const shippingAddress = dto.shipping_address as {
      street: string;
      city: string;
      state: string;
      postal_code: string;
      phone: string;
      country: string;
    };

    const orderShippingAddressDB: IOrderShippingAddressDB = {
      _id: generateUUID(),
      order_id: orderId,
      street: shippingAddress.street,
      city: shippingAddress.city,
      state: shippingAddress.state,
      postal_code: shippingAddress.postal_code,
      phone: shippingAddress.phone,
      country: shippingAddress.country,
    };
    const [order] = await this.query(trx).insert(orderData).returning("*");
    await Promise.all([
      query("order_items").insert(orderItems),
      query("order_shipping_address").insert(orderShippingAddressDB),
    ]);
    return order;
  }
  async updateDetails(id: string, dto: UpdateOrderDto, trx?: Knex.Transaction) {
    const orderData: Partial<IOrderDB> = this.cleanedUpdates({
      currency: dto.currency,
      invoice_id: dto.invoice_id,
      invoice_link: dto.invoice_link,
      payment: {
        method: dto.payment?.method,
        transaction_id: dto.payment?.transaction_id,
      },

      status: dto.status as OrderStatus,
      subtotal: dto.subtotal,
      total: dto.total,
      tax: dto.tax,
    });
    const orderItems: Partial<IOrderItemDB>[] = dto.items
      ? dto.items.map((item) =>
          this.cleanedUpdates({
            discount: item.discount,
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price,
            name: item.name,
            sku: item.sku,
            final_price: item.final_price,
            shipping_info_weight: item.shipping_info.weight,
            shipping_info_dimensions: {
              length: item.shipping_info.dimensions.length,
              width: item.shipping_info.dimensions.width,
              height: item.shipping_info.dimensions.height,
            },
          })
        )
      : [];
    // Ensure dto.shipping_address is properly typed
    const shippingAddress = dto.shipping_address;
    // as {
    //   street: string;
    //   city: string;
    //   state: string;
    //   postal_code: string;
    //   phone: string;
    //   country: string;
    // };

    const orderShippingAddressDB: Partial<IOrderShippingAddressDB> =
      this.cleanedUpdates({
        street: shippingAddress?.street,
        city: shippingAddress?.city,
        state: shippingAddress?.state,
        postal_code: shippingAddress?.postal_code,
        phone: shippingAddress?.phone,
        country: shippingAddress?.country,
      });
    const query = trx ?? this.knex;
    const [order] = await Promise.all([
      this.query(trx).where("_id", id).update(orderData).returning("*"),

      query("order_items").where("order_id", id).update(orderItems),
      query("order_shipping_address")
        .where("order_id", id)
        .update(orderShippingAddressDB),
    ]);
    return order as unknown as IOrderDB;
  }
  override async findById(id: string): Promise<IOrderDB | null> {
    return (
      (await this.query()
        .where("_id", id)
        .leftJoin(
          "order_shipping_address",
          "orders._id",
          "order_shipping_address.order_id"
        )
        .leftJoin("order_items", "orders._id", "order_items.order_id")
        .leftJoin("users", "orders.user_id", "users._id")
        // .leftJoin("products", "order_items.product_id", "products._id")
        .select(
          "orders.*",
          "order_shipping_address.street",
          "order_shipping_address.city",
          "order_shipping_address.state",
          "order_shipping_address.postal_code",
          "order_shipping_address.phone",
          "order_shipping_address.country",
          this.knex.raw(
            `jsonb_agg(
            json_build_object(
              'product_id', order_items.product_id,
              'name', order_items.name,
              'price', order_items.price,
              'discount', order_items.discount,
              'quantity', order_items.quantity,
              'sku', order_items.sku,
              'shipping_info_weight', order_items.shipping_info_weight,
              'shipping_info_dimensions', order_items.shipping_info_dimensions,
              'final_price', order_items.final_price
            )
          ) AS items`
          )
        )
        .groupBy(
          "orders._id",
          "order_shipping_address._id",
          "users._id"
          // "products._id"
        )
        .orderBy("orders.created_at", "desc")) as unknown as IOrderDB
    );
  }

  async updateStatus(
    orderId: string,
    status: UpdateOrderStatusDto["status"]
  ): Promise<IOrderDB | null> {
    const [updatedOrder] = await this.query()
      .where("_id", orderId)
      .update({
        status: status as OrderStatus,
      })
      .returning("*");
    return updatedOrder;

    // return await this.model
    //   .findByIdAndUpdate(
    //     orderId,
    //     { status },
    //     { new: true, runValidators: true }
    //   )
    //   .populate("user_id", "name email")
    //   .exec();
  }
  // override async update(
  //   id: string,
  //   dto: UpdateOrderDto,
  //   trx?: Knex.Transaction
  // ): Promise<IOrderDB | null> {
  //   return await this.model
  //     .findByIdAndUpdate(
  //       id,
  //       { $set: dto },
  //       { new: true, runValidators: true, trx }
  //     )
  //     .populate("user_id", "name email")
  //     .exec();
  // }

  async findByUser(
    user_id: string,
    options: QueryOptionConfig
  ): Promise<QueryBuilderResult<IOrderDB>> {
    const queryConfig: QueryBuilderConfig<IOrderDB> = {
      allowedFilters: ["user_id", "created_at"],
      //   allowedSorts: ["created_at", "updated_at"] as Array<keyof IOrderDB>,
      //   maxLimit: 100,
    };

    const searchParams = new URLSearchParams({
      ...Object.fromEntries(options.query.entries()),
      user_id: user_id,
      // ...(options?.page && { page: options.page.toString() }),
      // ...(options?.limit && { limit: options.limit.toString() }),
      // ...(options?.sort && { sort: options.sort }),
    });

    const queryBuilder = new QueryBuilder<IOrderDB>(
      this.knex,
      this.tableName,
      searchParams,
      queryConfig
    );

    if (options?.populate) {
      queryBuilder.join({
        table: "users",
        type: "left",
        on: {
          left: "user_id",
          right: "_id",
        },
        select: ["name", "email"],
      });
    }

    return await queryBuilder.execute();
  }

  async getOrders(
    options: QueryOptionConfig
  ): Promise<QueryBuilderResult<IOrderDB>> {
    const queryConfig: QueryBuilderConfig<IOrderDB> = {
      allowedFilters: ["user_id", "created_at", "status"],
      allowedSorts: ["created_at", "updated_at"],
      //   maxLimit: 100,
    };
    if (options.query.get("email")) {
      const usersSql = await this.knex("users")
        .whereRaw(
          "LOWER(email) ILIKE ?",
          `%${options.query.get("email")?.toLowerCase()}%`
        )
        .select("_id");
      // const users = await UserModel.find({
      //   email: new RegExp(options.query.get("email") || "", "i"),
      // })
      //   .select("_id")
      //   .lean();
      if (!usersSql.length) {
        return {
          docs: [],
          meta: {
            total: 0,
            limit: 0,
            page: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          },
        };
      }
      options.query.set(
        "user_id",
        usersSql.map((u) => u._id.toString()).join(",")
      );
    }
    const queryBuilder = new QueryBuilder<IOrderDB>(
      this.knex,
      this.tableName,
      options.query,
      queryConfig
    );

    if (options?.populate) {
      queryBuilder.join({
        table: "users",
        type: "left",
        on: {
          left: "user_id",
          right: "_id",
        },
        select: ["name", "email"],
      });
    }
    return await queryBuilder.execute();
  }
  async getLatestOrder(user_id: string): Promise<IOrderDB | null> {
    return (await this.query()
      .where("user_id", user_id)
      .leftJoin(
        "order_shipping_address",
        "orders._id",
        "order_shipping_address.order_id"
      )
      .leftJoin("order_items", "orders._id", "order_items.order_id")
      .leftJoin("users", "orders.user_id", "users._id")
      .select(
        "orders.*",
        "order_shipping_address.*",
        this.knex.raw(
          `jsonb_agg(
            json_build_object(
              'product_id', order_items.product_id,
              'name', order_items.name,
              'price', order_items.price,
              'discount', order_items.discount,
              'quantity', order_items.quantity,
              'sku', order_items.sku,
              'shipping_info_weight', order_items.shipping_info_weight,
              'shipping_info_dimensions', order_items.shipping_info_dimensions,
              'final_price', order_items.final_price
            )
          ) AS items`
        )
      )
      .groupBy("orders._id", "order_shipping_address._id")
      .first()) as unknown as IOrderDB;

    // this.model
    //   .findOne({ user_id })
    //   .sort({
    //     created_at: -1,
    //   })
    //   .lean();
  }
  async findByUserAndProduct(
    user_id: string,
    product_id: string
  ): Promise<IOrderDB | null> {
    return (await this.query()
      .where("user_id", user_id)
      .andWhere("product_id", product_id)
      .leftJoin(
        "order_shipping_address",
        "orders._id",
        "order_shipping_address.order_id"
      )
      .leftJoin("order_items", "orders._id", "order_items.order_id")
      .leftJoin("users", "orders.user_id", "users._id")
      .select(
        "orders.*",
        "order_shipping_address.street",
        "order_shipping_address.city",
        "order_shipping_address.state",
        "order_shipping_address.postal_code",
        "order_shipping_address.phone",
        "order_shipping_address.country",
        this.knex.raw(
          `jsonb_agg(
            json_build_object(
              'product_id', order_items.product_id,
              'name', order_items.name,
              'price', order_items.price,
              'discount', order_items.discount,
              'quantity', order_items.quantity,
              'sku', order_items.sku,
              'shipping_info_weight', order_items.shipping_info_weight,
              'shipping_info_dimensions', order_items.shipping_info_dimensions,
              'final_price', order_items.final_price
            )
          ) AS items`
        )
      )
      .groupBy("orders._id", "order_shipping_address._id")
      .first()) as unknown as IOrderDB;
  }
  async logAction(
    action: AuditAction,
    entityId: string,
    actor: string,
    changes: Omit<IAuditLogChangesDB, "_id" | "created_at" | "audit_log_id">[],
    context: Record<string, any> = {},
    source: AuditSource = AuditSource.WEB,
    trx?: Knex.Transaction
  ) {
    const query = trx ?? this.knex;
    const auditLogId = generateUUID();
    const correlationId = generateUUID();
    await query<
      Omit<IGAuditLogDB, "context"> & {
        context: string;
      }
    >("audit_logs").insert({
      _id: auditLogId,
      actor,
      action,
      entity_type: EntityType.ORDER,
      entity_id: entityId,
      source,
      correlation_id: correlationId,
      context: this.safeJson(context),
      // context: {
      //   changes,
      // },
    });
    if (!changes || changes.length === 0) {
      return;
    }
    // Insert changes into audit_log_changes table
    const changeData = changes.map((change) => ({
      _id: generateUUID(),
      audit_log_id: auditLogId,
      field: change.field,
      before: this.safeJson(change.before),
      after: this.safeJson(change.after),
      change_type: change.change_type,
    }));
    await query<IAuditLogChangesDB>("audit_log_changes").insert(changeData);
  }

  // private withOrderJoins(query: Knex.QueryBuilder) {
  //   return query
  //     .leftJoin("order_items", "orders._id", "order_items.order_id")
  //     .leftJoin(
  //       "order_shipping_address",
  //       "orders._id",
  //       "order_shipping_address.order_id"
  //     )
  //     .leftJoin("users", "orders.user_id", "users._id")
  //     .leftJoin("products", "order_items.product_id", "products._id");
  // }
}
