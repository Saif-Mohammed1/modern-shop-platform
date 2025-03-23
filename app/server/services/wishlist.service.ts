import WishlistModel from "../models/Wishlist.model";
import { assignAsObjectId } from "@/app/lib/utilities/assignAsObjectId";
import { WishlistRepository } from "../repositories/wishlist.repository";
import { QueryOptionConfig } from "@/app/lib/types/queryBuilder.types";
import { WishlistTranslate } from "@/public/locales/server/Wishlist.Translate";
import { lang } from "@/app/lib/utilities/lang";

export class WishlistService {
  constructor(
    private readonly repository: WishlistRepository = new WishlistRepository(
      WishlistModel
    )
  ) {}
  async getUserWishlists(userId: string, options: QueryOptionConfig) {
    return this.repository.getUserWishlists(userId, options);
  }
  async toggleWishlist(userId: string, productId: string) {
    try {
      const exists = await this.repository.isWishlist(userId, productId);
      if (exists) {
        // Remove from wishlist
        await this.repository.deleteWishlist(userId, productId);
        return {
          success: true,
          message: WishlistTranslate[lang].wishlist.remove,
          added: false,
        };
      } else {
        // Add to wishlist
        await this.repository.create({
          userId: assignAsObjectId(userId),
          productId: assignAsObjectId(productId),
        });

        return {
          success: true,
          message: WishlistTranslate[lang].wishlist.add,
          added: true,
        };
      }
    } catch (error) {
      throw error;
    }
  }

  async checkWishlist(userId: string, productId: string) {
    return this.repository.isWishlist(userId, productId);
  }
}
