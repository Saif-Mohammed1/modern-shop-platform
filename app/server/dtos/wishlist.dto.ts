import { z } from "zod";

import { zObjectId } from "@/app/lib/utilities/assignAsObjectId";

export class WishlistValidation {
  static createWishlistSchema = z.object({
    product_id: zObjectId,
    user_id: zObjectId,
  });
  static validateCreateWishlist = (data: any) => {
    return this.createWishlistSchema.parse(data);
  };
}

export type CreateWishlistDTO = z.infer<
  typeof WishlistValidation.createWishlistSchema
>;
