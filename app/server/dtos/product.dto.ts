// import { AuditSource } from "@/app/lib/types/audit.types";
import { zObjectId } from "@/app/lib/utilities/assignAsObjectId";
import { lang } from "@/app/lib/utilities/lang";
import { ProductTranslate } from "@/public/locales/server/Product.Translate";
// import type{ IpVersion } from "zod";
import { z } from "zod";
export class ProductValidation {
  private static imageObjectSchema = z.object({
    link: z
      .string({
        required_error: ProductTranslate[lang].dto.link.required,
      })
      .url(ProductTranslate[lang].dto.link.invalid),
    public_id: z.string({
      required_error: ProductTranslate[lang].dto.public_id.required,
    }),
  });

  // Allow `images` to be either an array of strings (base64) or an array of objects
  private static imagesSchema = z.union([
    z
      .array(
        z.string({
          required_error: ProductTranslate[lang].dto.images.required,
        })
      )
      .min(1, {
        message: ProductTranslate[lang].dto.images.required,
      }),
    z.array(this.imageObjectSchema).min(1),
  ]);
  // Define dimensions schema
  private static dimensionsSchema = z.object({
    length: z
      .number({
        required_error: ProductTranslate[lang].dto.length.min,
      })
      .min(0, {
        message: ProductTranslate[lang].dto.length.min,
      }),
    width: z
      .number({
        required_error: ProductTranslate[lang].dto.width.min,
      })
      .min(0, {
        message: ProductTranslate[lang].dto.width.min,
      }),
    height: z
      .number({
        required_error: ProductTranslate[lang].dto.height.min,
      })
      .min(0, {
        message: ProductTranslate[lang].dto.height.min,
      }),
  });

  // Define product schema
  static productSchema = z.object({
    name: z
      .string({
        required_error: ProductTranslate[lang].dto.name.required,
      })
      .min(6, {
        message: ProductTranslate[lang].dto.name.minlength,
      })
      .max(120, {
        message: ProductTranslate[lang].dto.name.maxlength,
      }),

    category: z.string({
      required_error: ProductTranslate[lang].dto.category.required,
    }),
    price: z
      .number({
        required_error: ProductTranslate[lang].dto.price.required,
      })
      .min(0.01, {
        message: ProductTranslate[lang].dto.price.min,
      })
      .transform((v) => Math.round(v * 100) / 100), // Fix floating point issues

    discount: z
      .number()
      .min(
        0,

        {
          message: ProductTranslate[lang].dto.discount.min,
        }
      )
      .optional(),
    // .max(100, "Discount cannot exceed 100"),
    discountExpire: z
      .union([z.string(), z.date()]) // Accept both string & Date
      .transform((val) => new Date(val)) // Convert string to Date
      .optional(),
    images: this.imagesSchema,

    userId: zObjectId, // Assuming it's a string
    // userId: z.string().min(1, {
    //   message:
    //     errorControllerTranslate[lang].controllers.handleValidationErrorDB
    //       .userId.required,
    // }), // Assuming it's a string
    description: z
      .string({
        required_error: ProductTranslate[lang].dto.description.required,
      })
      .min(50, {
        message: ProductTranslate[lang].dto.description.minlength,
      }),
    stock: z
      .number({
        required_error: ProductTranslate[lang].dto.stock.required,
      })
      .min(0, {
        message: ProductTranslate[lang].dto.stock.min,
      })
      .transform((v) => Math.floor(v)), // Ensure integer stock values
    ratingsAverage: z
      .number()
      .min(1, {
        message: ProductTranslate[lang].dto.ratingsAverage.min,
      })
      .max(5, {
        message: ProductTranslate[lang].dto.ratingsAverage.max,
      })
      .default(4.5)
      .transform((v) => Math.round(v * 10) / 10), // Round to 1 decimal
    ratingsQuantity: z
      .number()
      .min(0, {
        message: ProductTranslate[lang].dto.ratingsQuantity.min,
      })
      .default(0),
    active: z.boolean().default(true),
    sku: z.string().optional(), // Automatically generated
    reserved: z
      .number()
      .min(0, {
        message: ProductTranslate[lang].dto.reserved.min,
      })
      .default(0),
    sold: z
      .number()
      .min(0, {
        message: ProductTranslate[lang].dto.sold.min,
      })
      .default(0),
    attributes: z.record(z.string(), z.any()).optional(), // Flexible key-value attributes
    shippingInfo: z.object({
      weight: z.number().min(0, {
        message: ProductTranslate[lang].dto.weight.min,
      }),
      dimensions: this.dimensionsSchema,
    }),
  });

  // **Update Schema** - Partial to allow optional updates
  static updateProductSchema = this.productSchema.partial();

  static validateCreateProduct = (data: any) => {
    return this.productSchema.parse(data);
  };

  static validateUpdateProduct = (data: any) => {
    return this.updateProductSchema.parse(data);
  };
}

export type CreateProductDto = z.infer<typeof ProductValidation.productSchema>;
export type UpdateProductDto = z.infer<
  typeof ProductValidation.updateProductSchema
>;
