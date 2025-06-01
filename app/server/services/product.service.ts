import type { Knex } from "knex";

import {
  AuditAction,
  AuditSource,
  type IAuditLogChangesDB,
} from "@/app/lib/types/audit.db.types";
import type {
  IProductDB,
  IProductImagesDB,
  IProductViewBasicDB,
  IProductViewDB,
} from "@/app/lib/types/products.db.types";
import type {
  QueryBuilderResult,
  QueryOptionConfig,
} from "@/app/lib/types/queryBuilder.types";
import AppError from "@/app/lib/utilities/appError";
import { destroyImage, uploadImage } from "@/app/lib/utilities/cloudinary";
import { lang } from "@/app/lib/utilities/lang";
import { productControllerTranslate } from "@/public/locales/server/productControllerTranslate";

import { connectDB } from "../db/db";
import type { CreateProductDto, UpdateProductDto } from "../dtos/product.dto";
import { ProductRepository } from "../repositories/product.repository";

type productType = IProductViewDB | IProductViewBasicDB | IProductDB;
export class ProductService {
  constructor(
    private readonly repository: ProductRepository = new ProductRepository(
      connectDB()
    )
  ) {}

  private getUpdateChanges(oldDoc: productType, newDoc: productType) {
    const changes = [];
    const trackedFields = [
      "name",
      "price",
      "discount",
      "stock",
      "description",
      // "active",
      // "images",
    ];

    for (const field of trackedFields) {
      const oldValue = oldDoc[field as keyof productType];
      const newValue = newDoc[field as keyof productType];

      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes.push({
          field,
          before: oldValue,
          after: newValue,
          change_type: "MODIFY" as const,
        });
      }
    }
    return changes;
  }
  async findById(id: string, trx?: Knex.Transaction) {
    return await this.repository.findById(id, trx);
  }
  async createProduct(
    dto: CreateProductDto
    // logs: LogsTypeDto
  ): Promise<IProductDB> {
    let uploadedImages: Omit<
      IProductImagesDB,
      "_id" | "created_at" | "product_id"
    >[] = []; // [];
    if (
      typeof dto.images[0] === "string" &&
      this.isBase64Image(dto.images[0])
    ) {
      for (const image of dto.images as string[]) {
        if (!this.isBase64Image(image)) {
          throw new AppError("Invalid base64 image format", 400);
        }

        const result = await uploadImage(image, "shop/shop-products");
        uploadedImages.push({
          link: result.secure_url,
          public_id: result.public_id,
        });
      }
    } else {
      uploadedImages = dto.images as { link: string; public_id: string }[];
    }
    const trackedFields = [
      "name",
      "price",
      "discount",
      "stock",
      "description",
      "active",
      "images",
    ];
    const { user_id, images, ...productData } = dto;
    const imgs = JSON.stringify(uploadedImages);
    const getChanges = Object.keys(productData)
      .map((key) => {
        const before = trackedFields.includes(key) ? "" : undefined;

        const after = trackedFields.includes(key)
          ? productData[key as keyof typeof productData]
          : undefined;
        return {
          field: key,
          before,
          after,
          change_type: "ADD" as const,
        };
      })
      .filter((changes) => trackedFields.includes(changes.field));

    return await this.repository.transaction(async (trx) => {
      try {
        const product = await this.repository.createProduct(
          {
            ...dto,
            images: uploadedImages, // Ensure images are in the correct format
          },
          trx
        );

        await this.repository.logAction(
          AuditAction.CREATE,
          product.slug,
          dto.user_id,
          [
            ...getChanges,
            {
              field: "images",
              before: "",
              after: imgs,
              change_type: "ADD" as const,
            },
          ],
          // logs.ipAddress,
          // logs.userAgent,
          AuditSource.API, // Add source to LogsTypeDto
          trx
        );

        return product;
      } catch (error) {
        if (uploadedImages.length > 0) {
          const deleteImg = uploadedImages.map((image) =>
            destroyImage(image.public_id)
          );
          await Promise.all(deleteImg);
        }
        throw error;
      }
    });
  }

  async updateProduct(
    slug: string,
    dto: UpdateProductDto,
    actorId: CreateProductDto["user_id"]
    // logs: LogsTypeDto
  ): Promise<IProductDB | null> {
    const oldProduct = await this.repository.getProductBySlug(slug);
    if (!oldProduct) {
      throw new AppError(
        productControllerTranslate[lang].errors.noProductFoundWithId,
        404
      );
    }

    let uploadedImages: Omit<
      IProductImagesDB,
      "_id" | "created_at" | "product_id"
    >[] = []; // [];

    // If images are base64 strings, upload them
    if (dto.images) {
      const images = dto.images.filter((img) => !(typeof img === "object"));
      for (const image of images) {
        if (!this.isBase64Image(image)) {
          throw new AppError("Invalid base64 image format", 400);
        }
        this.validateBase64Image(image);
        const result = await uploadImage(image, "shop/shop-products");

        uploadedImages.push({
          link: result.secure_url,
          public_id: result.public_id,
        });
      }
    }
    //  const updatedImages = [...(oldProduct.images || []), ...uploadedImages].filter(
    //     Boolean
    //   );
    return await this.repository.transaction(async (trx) => {
      try {
        const updatedProduct = await this.repository.update(
          slug,
          {
            ...dto,
            actorId,
            images: uploadedImages,
            product_id: oldProduct._id,
          },
          trx
        );

        if (!updatedProduct) {
          throw new AppError(
            productControllerTranslate[lang].errors.noProductFoundWithId,
            404
          );
        }
        const changes = this.getUpdateChanges(oldProduct, updatedProduct);
        if (Object.keys(changes).length > 0) {
          await this.repository.logAction(
            AuditAction.UPDATE,
            updatedProduct.slug,
            actorId,
            changes,
            // logs.ipAddress,
            // logs.userAgent,
            AuditSource.API, // Add source to LogsTypeDto
            trx
          );
        }

        return updatedProduct;
      } catch (error) {
        if (uploadedImages.length > 0) {
          const deleteImg = uploadedImages.map((image) =>
            destroyImage(image.public_id)
          );
          await Promise.all(deleteImg);
        }
        throw error;
      }
    });
  }

  async deleteProduct(
    slug: string,
    actorId: CreateProductDto["user_id"]
    // logs: LogsTypeDto
  ): Promise<boolean> {
    const product = await this.repository.getProductBySlug(slug);
    if (!product) {
      throw new AppError(
        productControllerTranslate[lang].errors.noProductFoundWithId,
        404
      );
    }
    if (product.images) {
      // const utapi = new UTApi();
      const deleteImg = product.images.map((image) =>
        destroyImage(image.public_id)
      );
      await Promise.all(deleteImg);
    }
    return await this.repository.transaction(async (trx) => {
      const [result] = await Promise.all([
        this.repository.delete(product._id.toString(), trx),
        this.repository.logAction(
          AuditAction.DELETE,
          product.slug,
          actorId,
          [
            {
              change_type: "REMOVE",
              field: "product",
              before: product,
              after: "",
            },
          ],

          // logs.ipAddress,
          // logs.userAgent,
          AuditSource.API, // Add source to LogsTypeDto
          trx
        ),
      ]);
      return result;
    });
  }
  async getProductsByAdmin(
    options: QueryOptionConfig
    // isAdmin?: boolean
  ): Promise<QueryBuilderResult<IProductDB>> {
    return await this.repository.getProductsByAdmin(options);
    // console.log("Products fetched:", products);
    // if (!products || products.docs.length === 0) {
    //   throw new AppError(
    //     productControllerTranslate[lang].errors.notFoundProducts,
    //     404
    //   );
    // }
    // return products;
  }
  async getProducts(
    options: QueryOptionConfig
    // isAdmin?: boolean
  ): Promise<QueryBuilderResult<IProductViewBasicDB>> {
    return await this.repository.getProducts(options);
    // if (!products || products.docs.length === 0) {
    //   throw new AppError(
    //     productControllerTranslate[lang].errors.notFoundProducts,
    //     404
    //   );
    // }
    // return products;
  }
  async getProductById(id: string, trx?: Knex.Transaction) {
    const product = await this.repository.findById(id, trx);
    if (!product) {
      throw new AppError(
        productControllerTranslate[lang].errors.noProductFoundWithId,
        404
      );
    }
    return product;
  }
  async getProductBySlug(
    slug: string,
    options?: {
      populate?: boolean; //select?: string
    }
  ) {
    const product = await this.repository.getProductBySlug(slug, options);
    if (!product) {
      throw new AppError(
        productControllerTranslate[lang].errors.noProductFoundWithId,
        404
      );
    }
    return product;
  }
  async getProductMetaDataBySlug(slug: string) {
    //return await this.repository.getProductMetaDataBySlug(slug);
    const product = await this.repository.getProductMetaDataBySlug(slug);
    if (!product) {
      throw new AppError(
        productControllerTranslate[lang].errors.noProductFoundWithId,
        404
      );
    }
    return product;
  }
  async getProductsCategory(): Promise<string[]> {
    return await this.repository.getCategoryList();
  }
  async getProductsByCategory(category: string) {
    return await this.repository.getProductsByCategory(category);
  }
  async deleteProductImages(
    slug: string,
    public_id: string,
    actorId: CreateProductDto["user_id"]
    // logs: LogsTypeDto
  ) {
    await this.repository.transaction(async (trx) => {
      await Promise.all([
        this.repository.deleteProductImages(public_id, trx),

        this.repository.logAction(
          AuditAction.IMAGE_REMOVE, // Fixed action type
          slug,
          actorId,
          [
            {
              field: "images",
              before: public_id,
              after: "",
              change_type: "REMOVE" as const,
            },
          ],
          // logs.ipAddress,
          // logs.userAgent,
          AuditSource.API, // Add source to LogsTypeDto
          trx
        ),
      ]);
    });
    await destroyImage(public_id);
    // await product.save();
  }
  validateBase64Image(image: string): void {
    // Split the base64 string into the prefix and the data
    const [prefix, data] = image.split(",");

    // Check the file type from the prefix (e.g., 'data:image/jpeg;base64')
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/gif"];
    const mimeTypeMatch = prefix.match(/data:(.*?);base64/);

    // Add a null check for mimeTypeMatch
    if (!mimeTypeMatch || !mimeTypeMatch[1]) {
      throw new AppError(
        productControllerTranslate[
          lang
        ].functions.validateBase64Image.invalidImageFormat,
        400
      );
    }

    const mimeType = mimeTypeMatch[1];

    if (!allowedTypes.includes(mimeType)) {
      throw new AppError(
        productControllerTranslate[
          lang
        ].functions.validateBase64Image.invalidImageType,
        400
      );
    }

    // Calculate the size of the image in bytes
    const imageSizeInBytes = (data.length * 3) / 4;
    const imageSizeInMB = imageSizeInBytes / (1024 * 1024);

    if (imageSizeInMB > 2) {
      throw new AppError(
        productControllerTranslate[
          lang
        ].functions.validateBase64Image.imageSizeExceeds,
        400
      );
    }
  }
  async getTopOffersAndNewProducts() {
    return await this.repository.getTopOffersAndNewProducts();
  }
  async toggleProductActivity(
    slug: string,
    user_id: CreateProductDto["user_id"]
  ) {
    await this.repository.toggleProductActivity(slug, user_id);
  }
  async getProductHistory(
    slug: string,
    options: QueryOptionConfig,
    versionId?: string
  ) {
    return await this.repository.getProductHistory(slug, options, versionId);
  }

  async restoreProductVersion(
    slug: string,
    versionId: string,
    actorId: string
    // logs: LogsTypeDto
  ): Promise<IProductDB> {
    // Get current product first to ensure it exists
    const currentProduct = await this.repository.getProductBySlug(slug);
    if (!currentProduct) {
      throw new AppError(
        productControllerTranslate[lang].errors.noProductFoundWithId,
        404
      );
    }

    // Get historical version data using product ID
    const historicalData = await this.getProductHistory(
      slug,
      { query: new URLSearchParams() }, // Default query options
      versionId
    );

    if (!historicalData.docs.length) {
      throw new AppError(
        productControllerTranslate[lang].errors.HistoricalProductNotFound,
        404
      );
    }

    // Get the reconstructed product version
    const productVersion = historicalData.docs[0] as unknown as IProductDB;

    // Prepare update payload, filtering out null, undefined, or empty values
    const updatePayload: Partial<IProductDB> = {
      name: productVersion.name || undefined,
      price: productVersion.price ?? undefined,
      discount: productVersion.discount ?? undefined,
      stock: productVersion.stock ?? undefined,
      description: productVersion.description || undefined,
    };
    return await this.repository.transaction(async (trx) => {
      // Perform update
      const payload = {
        ...updatePayload,
        actorId,
        product_id: currentProduct._id,
        discount_expire: updatePayload.discount_expire || undefined,
      };
      const updatedProduct = await this.repository.update(slug, payload, trx);

      // Log restoration action with proper entity ID
      await this.repository.logAction(
        AuditAction.RESTORE,
        currentProduct.slug, // Use ObjectId instead of slug
        actorId,
        this.getUpdateChanges(currentProduct, updatedProduct!),
        // logs.ipAddress,
        // logs.userAgent,
        AuditSource.API, // Add source to LogsTypeDto
        trx
      );

      return updatedProduct!;
    });
  }
  async createLogs(
    action: AuditAction,
    entityId: string,
    actor: string,
    changes: Omit<IAuditLogChangesDB, "_id" | "created_at" | "audit_log_id">[],
    source: AuditSource = AuditSource.WEB,
    trx?: Knex.Transaction
  ) {
    await this.repository.logAction(
      action,
      entityId,
      actor,
      changes,
      // logs.ipAddress,
      // logs.userAgent,
      source, // Add source to LogsTypeDto
      trx
    );
  }
  private isBase64Image(str: string): boolean {
    const base64Pattern =
      /^data:image\/(png|jpeg|jpg|gif|webp);base64,[A-Za-z0-9+/=\n\r]+$/;

    return base64Pattern.test(str.trim());
  }
}
/**   topOfferProducts: products[0].topOfferProducts,
      newProducts: products[0].newProducts,
      topRating: products[0].topRating, */
// export default new ProductService();
// Compare this snippet from shop/app/_server/repositories/user.repository.ts:
