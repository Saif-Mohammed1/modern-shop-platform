import { z } from "zod";

import { zObjectId } from "@/app/lib/utilities/assignAsObjectId";
import { lang } from "@/app/lib/utilities/lang";
import { AddressTranslate } from "@/public/locales/server/Address.Translate";

const phoneRegex = /^\+380\d{9}$/;
export class AddressValidation {
  static CreateAddressDto = z.object({
    user_id: zObjectId,
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
  static UpdateAddressDto = this.CreateAddressDto.partial();
  static validatePhone(phone: string): boolean {
    return phoneRegex.test(phone);
  }
  static validateCreateAddress(data: any) {
    return this.CreateAddressDto.parse(data);
  }
  static validateUpdateAddress(data: any) {
    return this.UpdateAddressDto.parse(data);
  }
  static deleteAddressDto = z.object({
    id: zObjectId,
    user_id: zObjectId,
  });
  static validateId(data: any) {
    return this.deleteAddressDto.parse(data);
  }
}

export type CreateAddressDtoType = z.infer<
  typeof AddressValidation.CreateAddressDto
>;
export type UpdateAddressDtoType = z.infer<
  typeof AddressValidation.UpdateAddressDto
>;
