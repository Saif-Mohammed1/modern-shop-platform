// import type { QueryOptionConfig } from "@/app/lib/types/queryBuilder.types";
import { lang } from "@/app/lib/utilities/lang";
import { WishlistTranslate } from "@/public/locales/server/Wishlist.Translate";

import WishlistModel from "../models/Wishlist.model";
import { WishlistRepository } from "../repositories/wishlist.repository";

export class WishlistService {
  constructor(
    private readonly repository: WishlistRepository = new WishlistRepository(
      WishlistModel
    )
  ) {}
  async getUserWishlists(userId: string) {
    return await this.repository.getUserWishlists(userId);
  }
  // async getUserWishlists(userId: string, options: QueryOptionConfig) {
  //   return await this.repository.getUserWishlists(userId, options);
  // }
  async toggleWishlist(userId: string, productId: string) {
    const session = await this.repository.startSession();
    try {
      const exists = await this.checkWishlist(userId, productId);
      return await session.withTransaction(async () => {
        if (exists) {
          // Remove from wishlist
          await this.repository.deleteWishlist(userId, productId, session);
          return {
            success: true,
            message: WishlistTranslate[lang].wishlist.remove,
            added: false,
          };
        }
        // Add to wishlist
        await this.repository.addToWishlist(userId, productId, session);

        return {
          success: true,
          message: WishlistTranslate[lang].wishlist.add,
          added: true,
        };
      });
    } finally {
      await session.endSession();
    }
  }

  async checkWishlist(userId: string, productId: string) {
    return await this.repository.isWishlist(userId, productId);
  }
}
