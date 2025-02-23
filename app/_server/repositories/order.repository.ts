// src/repositories/order.repository.ts
import { Model, ClientSession } from "mongoose";
import {
  CreateOrderDto,
  UpdateOrderDto,
  UpdateOrderStatusDto,
} from "../dtos/order.dto";
import { IOrder } from "../models/order.model ";
import { BaseRepository } from "./BaseRepository";
import {
  QueryBuilderConfig,
  QueryBuilderResult,
  QueryOptionConfig,
} from "@/app/lib/types/queryBuilder.types";
import { QueryBuilder } from "@/app/lib/utilities/queryBuilder";
import User from "../models/user.model.old";

export class OrderRepository extends BaseRepository<IOrder> {
  constructor(model: Model<IOrder>) {
    super(model);
  }
  async create(dto: CreateOrderDto, session?: ClientSession): Promise<IOrder> {
    const [order] = await this.model.create([dto], {
      session,
    });
    return order;
  }

  async findById(id: string): Promise<IOrder | null> {
    return this.model
      .findById(id)
      .populate("userId", "name email")
      .lean()
      .exec();
  }

  async updateStatus(
    orderId: string,
    status: UpdateOrderStatusDto
  ): Promise<IOrder | null> {
    return this.model
      .findByIdAndUpdate(
        orderId,
        { status },
        { new: true, runValidators: true }
      )
      .populate("userId", "name email")
      .exec();
  }
  update(
    id: string,
    dto: UpdateOrderDto,
    session?: ClientSession
  ): Promise<IOrder | null> {
    return this.model
      .findByIdAndUpdate(
        id,
        { $set: dto },
        { new: true, runValidators: true, session }
      )
      .populate("userId", "name email")
      .exec();
  }

  async findByUser(
    userId: string,
    options: QueryOptionConfig
  ): Promise<QueryBuilderResult<IOrder>> {
    const queryConfig: QueryBuilderConfig<IOrder> = {
      allowedFilters: ["userId", "createdAt"],
      //   allowedSorts: ["createdAt", "updatedAt"] as Array<keyof IOrder>,
      //   maxLimit: 100,
    };

    const searchParams = new URLSearchParams({
      userId,
      // ...(options?.page && { page: options.page.toString() }),
      // ...(options?.limit && { limit: options.limit.toString() }),
      // ...(options?.sort && { sort: options.sort }),
      ...options.query,
    });

    const queryBuilder = new QueryBuilder<IOrder>(
      this.model,
      searchParams,
      queryConfig
    );

    if (options?.populate) {
      queryBuilder.populate([{ path: "userId", select: "name email" }]);
    }

    return queryBuilder.execute();
  }

  async getOrders(
    options: QueryOptionConfig
  ): Promise<QueryBuilderResult<IOrder>> {
    const queryConfig: QueryBuilderConfig<IOrder> = {
      allowedFilters: ["userId", "createdAt", "status"],
      allowedSorts: ["createdAt", "updatedAt"],

      //   maxLimit: 100,
    };
    if (options.query.get("email")) {
      const users = await User.find({
        email: new RegExp(options.query.get("email") || "", "i"),
      })
        .select("_id")
        .lean();
      if (!users.length)
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
      options.query.set("userId", users.map((u) => u._id.toString()).join(","));
    }
    const queryBuilder = new QueryBuilder<IOrder>(
      this.model,
      options.query,
      queryConfig
    );

    if (options?.populate) {
      queryBuilder.populate([{ path: "userId", select: "name email" }]);
    }

    return queryBuilder.execute();
  }
  async getLatestOrder(userId: string): Promise<IOrder | null> {
    return await this.model
      .findOne({ userId })
      .sort({
        createdAt: -1,
      })
      .lean();
  }
  async startSession(): Promise<ClientSession> {
    return this.model.db.startSession();
  }
}
