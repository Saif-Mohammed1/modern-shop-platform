// wishlist.repository.ts
import type { Model, ClientSession } from "mongoose";

// import type {
//   QueryBuilderConfig,
//   QueryBuilderResult,
//   QueryOptionConfig,
// } from "@/app/lib/types/queryBuilder.types";
import { assignAsObjectId } from "@/app/lib/utilities/assignAsObjectId";
// import { QueryBuilder } from "@/app/lib/utilities/queryBuilder";

import ProductModel from "../models/Product.model";
import type { IWishlist } from "../models/Wishlist.model";

import { BaseRepository } from "./BaseRepository";

export class WishlistRepository extends BaseRepository<IWishlist> {
  constructor(model: Model<IWishlist>) {
    super(model);
  }
  // override async create(
  //   dto: Partial<IWishlist>,
  //   session?: ClientSession
  // ): Promise<IWishlist> {
  //   const [Wishlist] = await this.model.create([dto], {
  //     session,
  //   });
  //   return Wishlist;
  // }
  async addToWishlist(
    userId: string,
    productId: string,
    session?: ClientSession
  ): Promise<void> {
    await this.model.updateOne(
      { userId },
      {
        $addToSet: {
          items: {
            productId: assignAsObjectId(productId),
            // quantity: 1,
          },
        },
      },
      { upsert: true, session }
    );
  }
  async deleteWishlist(
    userId: string,
    productId: string,
    session?: ClientSession
  ): Promise<void> {
    await this.model.updateOne(
      { userId },
      { $pull: { items: { productId: assignAsObjectId(productId) } } },
      { session }
    );
  }

  async getUserWishlists(
    userId: string
    // options: QueryOptionConfig
  ): Promise<IWishlist | null> {
    const wishlist = await this.model
      .findOne({ userId })
      .populate([
        { path: "userId", select: "name" },
        {
          path: "items.productId",
          select: "name price images slug",
          model: ProductModel,
        },
      ])
      .lean();
    return wishlist;
  }
  // async getUserWishlists(
  //   userId: string,
  //   options: QueryOptionConfig
  // ): Promise<QueryBuilderResult<IWishlist>> {
  //   const queryConfig: QueryBuilderConfig<IWishlist> = {
  //     allowedFilters: ["userId", "items.productId", "createdAt"],
  //     //   allowedSorts: ["createdAt", "updatedAt"] as Array<keyof IWishlist>,
  //     //   maxLimit: 100,
  //   };

  //   const searchParams = new URLSearchParams({
  //     ...Object.fromEntries(options.query.entries()),
  //     userId,
  //     // ...(options?.page && { page: options.page.toString() }),
  //     // ...(options?.limit && { limit: options.limit.toString() }),
  //     // ...(options?.sort && { sort: options.sort }),
  //   });
  //   const queryBuilder = new QueryBuilder<IWishlist>(
  //     this.model,
  //     searchParams,
  //     queryConfig
  //   );

  //   if (options?.populate) {
  //     queryBuilder.populate([
  //       { path: "userId", select: "name" },
  //       { path: "items.productId", select: "name price images slug" },
  //     ]);
  //   }

  //   return await queryBuilder.execute();
  // }

  async isWishlist(
    userId: string,
    productId: string,
    session?: ClientSession
  ): Promise<boolean> {
    const exists = await this.model
      .exists({
        userId,
        "items.productId": assignAsObjectId(productId),
      })
      .session(session ?? null);
    return !!exists;
  }

  async clearUserWishlists(userId: string): Promise<void> {
    await this.model.deleteMany({ userId });
  }
  async startSession(): Promise<ClientSession> {
    return await this.model.db.startSession();
  }
}
