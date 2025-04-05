import {z} from 'zod';

import {zObjectId} from '@/app/lib/utilities/assignAsObjectId';
import {lang} from '@/app/lib/utilities/lang';
import {CartTranslate} from '@/public/locales/server/Cart.Translate';

export class CartValidation {
  static cartSchema = z.object({
    productId: zObjectId,
    quantity: z
      .number({
        message: CartTranslate[lang].dto.quantity.number,
      })
      .int({
        message: CartTranslate[lang].dto.quantity.int,
      })
      .positive({
        message: CartTranslate[lang].dto.quantity.positive,
      })
      .min(1, {
        message: CartTranslate[lang].dto.quantity.min,
      })
      .default(1),
  });
  static localCartSchema = z.array(
    z.object({
      _id: zObjectId,
      quantity: z
        .number({
          message: CartTranslate[lang].dto.quantity.number,
        })
        .int({
          message: CartTranslate[lang].dto.quantity.int,
        })
        .positive({
          message: CartTranslate[lang].dto.quantity.positive,
        })
        .min(1, {
          message: CartTranslate[lang].dto.quantity.min,
        })
        .default(1),
    }),
  );
  static validateLocalCart(data: any) {
    return this.localCartSchema.parse(data);
  }

  static isValidProductId(id: any) {
    return zObjectId.parse(id);
  }
  static isCartValid(data: any) {
    return this.cartSchema.parse(data);
  }
}
export type CartTypeDto = z.infer<typeof CartValidation.cartSchema>;

export type localCartDto = z.infer<typeof CartValidation.localCartSchema>;
