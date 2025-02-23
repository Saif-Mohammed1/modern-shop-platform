// src/lib/dto/order.dto.ts
import { z } from "zod";
import { zObjectId } from "@/app/lib/utilities/assignAsObjectId";
import { OrderTranslate } from "@/public/locales/server/Order.Translate";
import { lang } from "@/app/lib/utilities/lang";
import { OrderStatus } from "@/app/lib/types/orders.types";
import { create } from "domain";

export class OrderValidation {
  static ShippingInfoSchema = z.object({
    street: z
      .string({
        required_error: OrderTranslate[lang].dto.street.required,
      })
      .min(1),
    city: z
      .string({
        required_error: OrderTranslate[lang].dto.city.required,
      })
      .min(1),
    state: z
      .string({
        required_error: OrderTranslate[lang].dto.state.required,
      })
      .min(1),
    postalCode: z
      .string({
        required_error: OrderTranslate[lang].dto.postalCode.required,
      })
      .min(1),
    phone: z
      .string({
        required_error: OrderTranslate[lang].dto.phone.required,
      })
      .min(1),
    country: z
      .string({
        required_error: OrderTranslate[lang].dto.country.required,
      })
      .min(1),
  });
  static OrderItemSchema = z.object({
    _id: zObjectId,
    name: z
      .string({
        required_error: OrderTranslate[lang].dto.items.name.required,
      })
      .min(1),
    quantity: z
      .number({
        required_error: OrderTranslate[lang].dto.items.quantity.required,
      })
      .min(1),
    price: z
      .number({
        required_error: OrderTranslate[lang].dto.items.price.required,
      })
      .min(0),
    discount: z.number().min(0).optional().default(0),
    finalPrice: z
      .number({
        required_error: OrderTranslate[lang].dto.items.finalPrice.required,
      })
      .min(0),
    discountExpire: z.date().optional(),
  });
  static CreateOrderDtoSchema = z.object({
    userId: zObjectId,
    shippingInfo: this.ShippingInfoSchema,
    items: z.array(this.OrderItemSchema),
    invoiceId: z
      .string({
        required_error: OrderTranslate[lang].dto.invoiceId.required,
      })
      .min(1),
    invoiceLink: z
      .string({
        required_error: OrderTranslate[lang].dto.invoiceLink.required,
      })
      .min(1),
    totalPrice: z
      .number({
        required_error: OrderTranslate[lang].dto.totalPrice.required,
      })
      .min(0),
  });

  static UpdateOrderDtoSchema = this.CreateOrderDtoSchema.partial();
  static UpdateOrderStatusDtoSchema = z.object({
    status: z.enum(Object.values(OrderStatus) as [string, ...string[]]),
  });

  static validateCreateOrder(body: any) {
    return this.CreateOrderDtoSchema.parse(body);
  }

  static validateUpdateOrderStatus(body: any) {
    return this.UpdateOrderStatusDtoSchema.parse(body);
  }
  static validateUpdateOrder(body: any) {
    return this.UpdateOrderDtoSchema.parse(body);
  }
}

export type CreateOrderDto = z.infer<
  typeof OrderValidation.CreateOrderDtoSchema
>;
export type UpdateOrderStatusDto = z.infer<
  typeof OrderValidation.UpdateOrderStatusDtoSchema
>;
export type UpdateOrderDto = z.infer<
  typeof OrderValidation.UpdateOrderDtoSchema
>;
