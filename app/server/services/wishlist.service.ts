// import type { QueryOptionConfig } from "@/app/lib/types/queryBuilder.types";

import type { Knex } from "knex";

import { generateUUID } from "@/app/lib/utilities/id";
import { lang } from "@/app/lib/utilities/lang";
import { WishlistTranslate } from "@/public/locales/server/Wishlist.Translate";

import { connectDB } from "../db/db";
import { WishlistRepository } from "../repositories/wishlist.repository";

export class WishlistService {
  constructor(
    private readonly repository: WishlistRepository = new WishlistRepository(
      connectDB()
    )
  ) {}
  async getUserWishlists(user_id: string) {
    return await this.repository.getUserWishlists(user_id);
  }
  // async getUserWishlists(user_id: string, options: QueryOptionConfig) {
  //   return await this.repository.getUserWishlists(user_id, options);
  // }
  async toggleWishlist(user_id: string, product_id: string) {
    const exists = await this.checkWishlist(user_id, product_id);
    return await this.repository.transaction(async (trx) => {
      if (exists) {
        // Remove from wishlist
        await this.repository.deleteWishlist(user_id, product_id, trx);
        // const exists = await this.checkWishlist(user_id, product_id, trx);
        // console.log("exists", exists);
        return {
          success: true,
          message: WishlistTranslate[lang].wishlist.remove,
          added: false,
        };
      }
      // Add to wishlist
      await this.repository.create(
        {
          _id: generateUUID(),
          product_id: product_id,
          user_id: user_id,
        },
        trx
      );

      return {
        success: true,
        message: WishlistTranslate[lang].wishlist.add,
        added: true,
      };
    });
  }

  async checkWishlist(
    user_id: string,
    product_id: string,
    trx?: Knex.Transaction
  ) {
    return await this.repository.isWishlist(user_id, product_id, trx);
  }
}
