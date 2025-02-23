import { zObjectId } from "@/app/lib/utilities/assignAsObjectId";
import { lang } from "@/app/lib/utilities/lang";
import { AddressTranslate } from "@/public/locales/server/Address.Translate";
import { z } from "zod";

const phoneRegex = /^\+380\d{9}$/;
export class AddressValidation {
  static CreateAddressDto = z.object({
    userId: zObjectId,
    street: z.string().trim().min(1, AddressTranslate[lang].street.required),
    city: z.string().trim().min(1, AddressTranslate[lang].city.required),
    state: z.string().trim().min(1, AddressTranslate[lang].state.required),
    postalCode: z
      .string()
      .trim()
      .min(1, AddressTranslate[lang].postalCode.required),
    phone: z.string().regex(phoneRegex, AddressTranslate[lang].phone.invalid),
    country: z.string().trim().min(1, AddressTranslate[lang].country.required),
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
    userId: zObjectId,
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
