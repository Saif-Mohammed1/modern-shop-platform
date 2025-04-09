// wishlist.repository.ts
import type { Model, ClientSession } from "mongoose";

import type {
  QueryBuilderConfig,
  QueryBuilderResult,
  QueryOptionConfig,
} from "@/app/lib/types/queryBuilder.types";
import { QueryBuilder } from "@/app/lib/utilities/queryBuilder";

import type { IWishlist } from "../models/Wishlist.model";

import { BaseRepository } from "./BaseRepository";

export class WishlistRepository extends BaseRepository<IWishlist> {
  constructor(model: Model<IWishlist>) {
    super(model);
  }
  override async create(
    dto: Partial<IWishlist>,
    session?: ClientSession
  ): Promise<IWishlist> {
    const [Wishlist] = await this.model.create([dto], {
      session,
    });
    return Wishlist;
  }

  async deleteWishlist(
    userId: string,
    productId: string,
    session?: ClientSession
  ): Promise<boolean> {
    const result = await this.model.deleteOne(
      { productId, userId },
      { session }
    );
    return result.deletedCount === 1;
  }

  async getUserWishlists(
    userId: string,
    options: QueryOptionConfig
  ): Promise<QueryBuilderResult<IWishlist>> {
    const queryConfig: QueryBuilderConfig<IWishlist> = {
      allowedFilters: ["userId", "productId", "createdAt"],
      //   allowedSorts: ["createdAt", "updatedAt"] as Array<keyof IWishlist>,
      //   maxLimit: 100,
    };

    const searchParams = new URLSearchParams({
      ...Object.fromEntries(options.query.entries()),
      userId,
      // ...(options?.page && { page: options.page.toString() }),
      // ...(options?.limit && { limit: options.limit.toString() }),
      // ...(options?.sort && { sort: options.sort }),
    });
    const queryBuilder = new QueryBuilder<IWishlist>(
      this.model,
      searchParams,
      queryConfig
    );

    if (options?.populate) {
      queryBuilder.populate([
        { path: "userId", select: "name" },
        { path: "productId", select: "name price images slug" },
      ]);
    }

    return await queryBuilder.execute();
  }

  async isWishlist(userId: string, productId: string): Promise<boolean> {
    const exists = await this.model.exists({ userId, productId });
    return !!exists;
  }

  async clearUserWishlists(userId: string): Promise<void> {
    await this.model.deleteMany({ userId });
  }
}
