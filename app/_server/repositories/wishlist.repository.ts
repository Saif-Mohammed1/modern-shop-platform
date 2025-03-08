// wishlist.repository.ts

import {
  QueryBuilderResult,
  QueryOptionConfig,
} from "@/app/lib/types/queryBuilder.types";
import { QueryBuilder } from "@/app/lib/utilities/queryBuilder";
import { ClientSession, Model } from "mongoose";
import { BaseRepository } from "./BaseRepository";
import { IWishlist } from "../models/Wishlist.model";

export class WishlistRepository extends BaseRepository<IWishlist> {
  constructor(model: Model<IWishlist>) {
    super(model);
  }
  async create(
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
    const queryConfig = {
      allowedFilters: ["userId", "productId", "createdAt"] as Array<
        keyof IWishlist
      >,
      //   allowedSorts: ["createdAt", "updatedAt"] as Array<keyof IWishlist>,
      //   maxLimit: 100,
    };

    const searchParams = new URLSearchParams({
      userId,
      // ...(options?.page && { page: options.page.toString() }),
      // ...(options?.limit && { limit: options.limit.toString() }),
      // ...(options?.sort && { sort: options.sort }),
      ...options.query,
    });

    const queryBuilder = new QueryBuilder<IWishlist>(
      this.model,
      searchParams,
      queryConfig
    );

    if (options?.populate) {
      queryBuilder.populate([
        { path: "userId", select: "name email" },
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
