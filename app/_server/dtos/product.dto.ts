import { zObjectId } from "@/app/lib/utilities/assignAsObjectId";
import { lang } from "@/app/lib/utilities/lang";
import { errorControllerTranslate } from "@/public/locales/server/errorControllerTranslate";
import { z } from "zod";
export class ProductValidation {
  private static imageObjectSchema = z.object({
    link: z
      .string({
        required_error:
          errorControllerTranslate[lang].controllers.handleValidationErrorDB
            .product.link.required,
      })
      .url(
        errorControllerTranslate[lang].controllers.handleValidationErrorDB
          .product.link.invalid
      ),
    public_id: z.string({
      required_error:
        errorControllerTranslate[lang].controllers.handleValidationErrorDB
          .product.public_id.required,
    }),
  });

  // Allow `images` to be either an array of strings (base64) or an array of objects
  private static imagesSchema = z.union([
    z.array(z.string()).min(1, {
      message:
        errorControllerTranslate[lang].controllers.handleValidationErrorDB
          .product.images.required,
    }),
    z.array(this.imageObjectSchema).min(1),
  ]);
  // Define dimensions schema
  private static dimensionsSchema = z.object({
    length: z.number().min(0, {
      message:
        errorControllerTranslate[lang].controllers.handleValidationErrorDB
          .product.length.min,
    }),
    width: z.number().min(0, {
      message:
        errorControllerTranslate[lang].controllers.handleValidationErrorDB
          .product.width.min,
    }),
    height: z.number().min(0, {
      message:
        errorControllerTranslate[lang].controllers.handleValidationErrorDB
          .product.height.min,
    }),
  });

  // Define product schema
  static productSchema = z.object({
    name: z
      .string({
        required_error:
          errorControllerTranslate[lang].controllers.handleValidationErrorDB
            .product.name.required,
      })
      .min(6, {
        message:
          errorControllerTranslate[lang].controllers.handleValidationErrorDB
            .product.name.minlength,
      })
      .max(120, {
        message:
          errorControllerTranslate[lang].controllers.handleValidationErrorDB
            .product.name.maxlength,
      }),

    category: z.string({
      required_error:
        errorControllerTranslate[lang].controllers.handleValidationErrorDB
          .product.category.required,
    }),
    price: z
      .number({
        required_error:
          errorControllerTranslate[lang].controllers.handleValidationErrorDB
            .product.price.required,
      })
      .min(0.01, {
        message:
          errorControllerTranslate[lang].controllers.handleValidationErrorDB
            .product.price.min,
      })
      .transform((v) => Math.round(v * 100) / 100), // Fix floating point issues

    discount: z
      .number()
      .min(
        0,

        {
          message:
            errorControllerTranslate[lang].controllers.handleValidationErrorDB
              .product.discount.min,
        }
      )
      .optional(),
    // .max(100, "Discount cannot exceed 100"),
    discountExpire: z.date().optional(),
    images: this.imagesSchema,

    userId: zObjectId, // Assuming it's a string
    // userId: z.string().min(1, {
    //   message:
    //     errorControllerTranslate[lang].controllers.handleValidationErrorDB
    //       .product.userId.required,
    // }), // Assuming it's a string
    description: z
      .string({
        required_error:
          errorControllerTranslate[lang].controllers.handleValidationErrorDB
            .product.description.required,
      })
      .min(50, {
        message:
          errorControllerTranslate[lang].controllers.handleValidationErrorDB
            .product.description.minlength,
      }),
    stock: z
      .number({
        required_error:
          errorControllerTranslate[lang].controllers.handleValidationErrorDB
            .product.stock.required,
      })
      .min(0, {
        message:
          errorControllerTranslate[lang].controllers.handleValidationErrorDB
            .product.stock.min,
      })
      .transform((v) => Math.floor(v)), // Ensure integer stock values
    ratingsAverage: z
      .number()
      .min(1, {
        message:
          errorControllerTranslate[lang].controllers.handleValidationErrorDB
            .product.ratingsAverage.min,
      })
      .max(5, {
        message:
          errorControllerTranslate[lang].controllers.handleValidationErrorDB
            .product.ratingsAverage.max,
      })
      .default(4.5)
      .transform((v) => Math.round(v * 10) / 10), // Round to 1 decimal
    ratingsQuantity: z
      .number()
      .min(0, {
        message:
          errorControllerTranslate[lang].controllers.handleValidationErrorDB
            .product.ratingsQuantity.min,
      })
      .default(0),
    active: z.boolean().default(true),
    sku: z.string().optional(), // Automatically generated
    reserved: z
      .number()
      .min(0, {
        message:
          errorControllerTranslate[lang].controllers.handleValidationErrorDB
            .product.reserved.min,
      })
      .default(0),
    sold: z
      .number()
      .min(0, {
        message:
          errorControllerTranslate[lang].controllers.handleValidationErrorDB
            .product.sold.min,
      })
      .default(0),
    attributes: z.record(z.string(), z.any()).optional(), // Flexible key-value attributes
    shippingInfo: z.object({
      weight: z.number().min(0, {
        message:
          errorControllerTranslate[lang].controllers.handleValidationErrorDB
            .product.weight.min,
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
