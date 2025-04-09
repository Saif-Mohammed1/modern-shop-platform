import {z} from 'zod';

import {zObjectId} from '@/app/lib/utilities/assignAsObjectId';

export class WishlistValidation {
  static createWishlistSchema = z.object({
    productId: zObjectId,
    userId: zObjectId,
  });
  static validateCreateWishlist = (data: any) => {
    return this.createWishlistSchema.parse(data);
  };
}

export type CreateWishlistDTO = z.infer<typeof WishlistValidation.createWishlistSchema>;
