import { z } from "zod";

import { zObjectId } from "@/app/lib/utilities/assignAsObjectId";
import { lang } from "@/app/lib/utilities/lang";
import { AddressTranslate } from "@/public/locales/server/Address.Translate";
import { CartTranslate } from "@/public/locales/server/Cart.Translate";

const phoneRegex = /^\+380\d{9}$/;

export class StripeValidation {
  static ShippingInfoSchema = z.object({
    street: z
      .string({ required_error: AddressTranslate[lang].street.required })
      .trim()
      .min(1, AddressTranslate[lang].street.required),
    city: z
      .string({
        required_error: AddressTranslate[lang].city.required,
      })
      .trim()
      .min(1, AddressTranslate[lang].city.required),
    state: z
      .string({
        required_error: AddressTranslate[lang].state.required,
      })
      .trim()
      .min(1, AddressTranslate[lang].state.required),
    postal_code: z
      .string({
        required_error: AddressTranslate[lang].postal_code.required,
      })
      .trim()
      .min(1, AddressTranslate[lang].postal_code.required),
    phone: z
      .string({
        required_error: AddressTranslate[lang].phone.required,
      })
      .regex(phoneRegex, AddressTranslate[lang].phone.invalid),
    country: z
      .string({
        required_error: AddressTranslate[lang].country.required,
      })
      .trim()
      .min(1, AddressTranslate[lang].country.required),
  });
  static StripeProductItemSchema = z.array(
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
    })
  );
  static StripeSessionSchema = z.object({
    shipping_info: this.ShippingInfoSchema,
    products: this.StripeProductItemSchema,
  });
  static validateStripeSession(data: any) {
    return this.StripeSessionSchema.parse(data);
  }
  static validateShippingInfo(data: any) {
    return this.ShippingInfoSchema.parse(data);
  }
  static validateProductItem(data: any) {
    return this.StripeProductItemSchema.parse(data);
  }
}
export type ShippingInfoDto = z.infer<
  typeof StripeValidation.ShippingInfoSchema
>;
export type StripeProductItemDto = z.infer<
  typeof StripeValidation.StripeProductItemSchema
>;
export type StripeSessionDto = z.infer<
  typeof StripeValidation.StripeSessionSchema
>;
