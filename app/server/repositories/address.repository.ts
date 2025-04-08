// address.repository.ts
import type { Model, ClientSession } from "mongoose";

import type {
  QueryBuilderConfig,
  QueryBuilderResult,
  QueryOptionConfig,
} from "@/app/lib/types/queryBuilder.types";
import { QueryBuilder } from "@/app/lib/utilities/queryBuilder";

import {
  type CreateAddressDtoType,
  // UpdateAddressDtoType,
} from "../dtos/address.dto";
import type { IAddress } from "../models/Address.model";

import { BaseRepository } from "./BaseRepository";

export class AddressRepository extends BaseRepository<IAddress> {
  constructor(model: Model<IAddress>) {
    super(model);
  }
  override async create(
    dto: CreateAddressDtoType,
    session?: ClientSession
  ): Promise<IAddress> {
    const [address] = await this.model.create([dto], {
      session,
    });
    return address;
  }
  override async update(
    id: string,
    data: Partial<IAddress>,
    session?: ClientSession
  ): Promise<IAddress | null> {
    const address = await this.model.findOneAndUpdate(
      { _id: id, userId: data.userId },
      { $set: data },
      { new: true, session }
    );
    return address;
  }
  async deleteAddress(
    id: string,
    userId: string,
    session?: ClientSession
  ): Promise<boolean> {
    const result = await this.model.deleteOne({ _id: id, userId }, { session });
    return result.deletedCount === 1;
  }

  async getUserAddress(
    userId: string,
    options: QueryOptionConfig
  ): Promise<QueryBuilderResult<IAddress>> {
    const queryConfig: QueryBuilderConfig<IAddress> = {
      allowedFilters: ["userId", "createdAt"],
      //   allowedSorts: ["createdAt", "updatedAt"] as Array<keyof IAddress>,
      //   maxLimit: 100,
    };

    const searchParams = new URLSearchParams({
      ...Object.fromEntries(options.query.entries()),
      userId,
      // ...(options?.page && { page: options.page.toString() }),
      // ...(options?.limit && { limit: options.limit.toString() }),
      // ...(options?.sort && { sort: options.sort }),
    });

    const queryBuilder = new QueryBuilder<IAddress>(
      this.model,
      searchParams,
      queryConfig
    );

    if (options?.populate) {
      queryBuilder.populate([{ path: "userId", select: "name email" }]);
    }

    return await queryBuilder.execute();
  }
  async startSession(): Promise<ClientSession> {
    return await this.model.db.startSession();
  }
}
