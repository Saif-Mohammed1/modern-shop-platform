// src/lib/dto/order.dto.ts
import {z} from 'zod';

import {OrderStatus} from '@/app/lib/types/orders.types';
import {UserCurrency} from '@/app/lib/types/users.types';
import {zObjectId} from '@/app/lib/utilities/assignAsObjectId';
import {lang} from '@/app/lib/utilities/lang';
import {OrderTranslate} from '@/public/locales/server/Order.Translate';
import {ProductTranslate} from '@/public/locales/server/Product.Translate';

export class OrderValidation {
  private static dimensionsSchema = z.object({
    length: z.number().min(0, {
      message: ProductTranslate[lang].dto.length.min,
    }),
    width: z.number().min(0, {
      message: ProductTranslate[lang].dto.width.min,
    }),
    height: z.number().min(0, {
      message: ProductTranslate[lang].dto.height.min,
    }),
  });
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
    productId: zObjectId,
    name: z
      .string({
        required_error: OrderTranslate[lang].dto.items.name.required,
      })
      .min(1),
    price: z
      .number({
        required_error: OrderTranslate[lang].dto.items.price.required,
      })
      .min(0),
    discount: z.number().min(0).optional().default(0),

    quantity: z
      .number({
        required_error: OrderTranslate[lang].dto.items.quantity.required,
      })
      .min(1),
    sku: z
      .string({
        required_error: OrderTranslate[lang].dto.items.sku.required,
      })
      .min(0),

    attributes: z.record(z.string(), z.any()).optional(), // Flexible key-value attributes
    shippingInfo: z.object({
      weight: z.number().min(0, {
        message: ProductTranslate[lang].dto.weight.min,
      }),
      dimensions: this.dimensionsSchema,
    }),
    finalPrice: z
      .number({
        required_error: OrderTranslate[lang].dto.items.finalPrice.required,
      })
      .min(0),
  });
  static CreateOrderDtoSchema = z.object({
    userId: zObjectId,
    shippingAddress: this.ShippingInfoSchema,
    items: z.array(this.OrderItemSchema),
    status: z.enum(Object.values(OrderStatus) as [string, ...string[]]),

    currency: z
      .enum(Object.values(UserCurrency) as [string, ...string[]])
      .default(UserCurrency.UAH),
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
    total: z
      .number({
        required_error: OrderTranslate[lang].dto.totalPrice.required,
      })
      .min(0),
    subtotal: z.number({required_error: OrderTranslate[lang].dto.subtotal.required}).min(0),
    // shippingCost: z.number().min(0),
    tax: z.number({required_error: OrderTranslate[lang].dto.tax.required}).min(0),
    orderNotes: z.array(z.string()).optional(),
    cancellationReason: z.string().optional(),
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

export type CreateOrderDto = z.infer<typeof OrderValidation.CreateOrderDtoSchema>;
export type UpdateOrderStatusDto = z.infer<typeof OrderValidation.UpdateOrderStatusDtoSchema>;
export type UpdateOrderDto = z.infer<typeof OrderValidation.UpdateOrderDtoSchema>;
