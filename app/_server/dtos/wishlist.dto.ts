import { zObjectId } from "@/app/lib/utilities/assignAsObjectId";
import { z } from "zod";

export class WishlistValidation {
  static createWishlistSchema = z.object({
    productId: zObjectId,
    userId: zObjectId,
  });
  static validateCreateWishlist = (data: any) => {
    return this.createWishlistSchema.parse(data);
  };
}

export type CreateWishlistDTO = z.infer<
  typeof WishlistValidation.createWishlistSchema
>;
