import type {Types} from 'mongoose';
import {type ClientSession} from 'mongoose';

import {AuditAction, AuditSource, EntityType} from '@/app/lib/types/audit.types';
import type {
  QueryBuilderConfig,
  QueryBuilderResult,
  QueryOptionConfig,
} from '@/app/lib/types/queryBuilder.types';
import AppError from '@/app/lib/utilities/appError';
import {destroyImage, uploadImage} from '@/app/lib/utilities/cloudinary';
import {lang} from '@/app/lib/utilities/lang';
import {QueryBuilder} from '@/app/lib/utilities/queryBuilder';
import {productControllerTranslate} from '@/public/locales/server/productControllerTranslate';

import type {LogsTypeDto} from '../dtos/logs.dto';
import type {CreateProductDto, UpdateProductDto} from '../dtos/product.dto';
import AuditLogModel, {type IAuditLog} from '../models/audit-log.model';
import ProductModel, {type IProduct} from '../models/Product.model';
import {ProductRepository} from '../repositories/product.repository';

export class ProductService {
  constructor(
    private readonly repository: ProductRepository = new ProductRepository(ProductModel),
  ) {}
  async logAction(
    action: AuditAction,
    entityId: string,
    actor: Types.ObjectId,
    changes: Array<{
      field: string;
      before?: any;
      after?: any;
      changeType: 'ADD' | 'MODIFY' | 'REMOVE';
    }>,
    ipAddress: string,
    userAgent: string,
    source: AuditSource = AuditSource.WEB,
    session?: ClientSession,
  ) {
    await AuditLogModel.create(
      [
        {
          actor,
          action,
          entityType: EntityType.PRODUCT,
          entityId,
          changes,
          ipAddress,
          userAgent,
          source,
        },
      ],
      {session},
    );
  }

  private getUpdateChanges(oldDoc: IProduct, newDoc: IProduct) {
    const changes = [];
    const trackedFields = ['name', 'price', 'discount', 'stock', 'description', 'active', 'images'];

    for (const field of trackedFields) {
      const oldValue = oldDoc[field as keyof IProduct];
      const newValue = newDoc[field as keyof IProduct];

      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes.push({
          field,
          before: oldValue,
          after: newValue,
          changeType: 'MODIFY' as const,
        });
      }
    }
    return changes;
  }
  async createProduct(dto: CreateProductDto, logs: LogsTypeDto): Promise<IProduct> {
    const session = await this.repository.startSession();
    session.startTransaction();
    try {
      let uploadedImages: IProduct['images'] = []; // [];

      // If images are base64 strings, upload them
      if (typeof dto.images[0] === 'string') {
        for (const image of dto.images as string[]) {
          this.validateBase64Image(image);
          const result = await uploadImage(image, 'shop/shop-products');

          uploadedImages.push({
            link: result.secure_url,
            public_id: result.public_id,
          });
        }
      } else {
        // If already formatted as objects, keep them
        uploadedImages = dto.images as {link: string; public_id: string}[];
      }
      dto.images = uploadedImages;

      const product = await this.repository.create(dto, session);

      const {userId, ...productData} = dto;
      productData.images = uploadedImages;

      const changes = Object.entries(productData).map(([field, value]) => ({
        field,
        after: value,
        changeType: 'ADD' as const,
      }));

      await this.logAction(
        AuditAction.CREATE,
        product.slug,
        dto.userId,
        changes,
        logs.ipAddress,
        logs.userAgent,
        logs.source as AuditSource, // Add source to LogsTypeDto
        session,
      );

      await session.commitTransaction();
      return product;
    } catch (error) {
      await session.abortTransaction();

      throw error;
    } finally {
      await session.endSession();
    }
  }

  async updateProduct(
    slug: string,
    dto: UpdateProductDto,
    actorId: CreateProductDto['userId'],
    logs: LogsTypeDto,
  ): Promise<IProduct | null> {
    const session = await this.repository.startSession();
    session.startTransaction();
    try {
      const oldProduct = await this.repository.getProductBySlug(slug);
      if (!oldProduct) {
        throw new AppError(productControllerTranslate[lang].errors.noProductFoundWithId, 404);
      }
      let uploadedImages: IProduct['images'] = []; // [];

      // If images are base64 strings, upload them
      if (dto.images) {
        const images = dto.images.filter((img) => !(typeof img === 'object'));
        for (const image of images) {
          this.validateBase64Image(image);
          const result = await uploadImage(image, 'shop/shop-products');

          uploadedImages.push({
            link: result.secure_url,
            public_id: result.public_id,
          });
        }
      }
      dto.images = [...(oldProduct.images || []), ...uploadedImages].filter(Boolean);
      const updatedProduct = await this.repository.update(slug, {...dto, actorId}, session);

      if (!updatedProduct)
        throw new AppError(productControllerTranslate[lang].errors.noProductFoundWithId, 404);

      const changes = this.getUpdateChanges(oldProduct, updatedProduct);
      if (Object.keys(changes).length > 0) {
        await this.logAction(
          AuditAction.UPDATE,
          updatedProduct.slug,
          actorId,
          changes,
          logs.ipAddress,
          logs.userAgent,
          logs.source as AuditSource, // Add source to LogsTypeDto
          session,
        );
      }

      await session.commitTransaction();
      return updatedProduct;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  async deleteProduct(
    slug: string,
    actorId: CreateProductDto['userId'],
    logs: LogsTypeDto,
  ): Promise<boolean> {
    const session = await this.repository.startSession();
    session.startTransaction();
    try {
      const product = await this.repository.getProductBySlug(slug);
      if (!product) {
        throw new AppError(productControllerTranslate[lang].errors.noProductFoundWithId, 404);
      }
      if (product.images) {
        // const utapi = new UTApi();
        for (const image of product.images) {
          //   await utapi.deleteFiles(public_id);

          // for cloudainry
          await destroyImage(image.public_id);
        }
      }
      const result = await this.repository.delete(product._id.toString(), session);
      await this.logAction(
        AuditAction.DELETE,
        product.slug,
        actorId,
        [
          {
            changeType: 'REMOVE',
            field: 'product',
            before: product,
            after: undefined,
          },
        ],

        logs.ipAddress,
        logs.userAgent,
        logs.source as AuditSource, // Add source to LogsTypeDto
        session,
      );
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();

      throw error;
    } finally {
      await session.endSession();
    }
  }
  async getProducts(
    options: QueryOptionConfig,
    isAdmin?: boolean,
  ): Promise<QueryBuilderResult<IProduct>> {
    const products = await this.repository.getProducts(options, isAdmin);
    if (!products || products.docs.length === 0) {
      throw new AppError(productControllerTranslate[lang].errors.notFoundProducts, 404);
    }
    return products;
  }
  async getProductById(id: string, session?: ClientSession) {
    const product = await this.repository.findById(id, session);
    if (!product) {
      throw new AppError(productControllerTranslate[lang].errors.noProductFoundWithId, 404);
    }
    return product;
  }
  async getProductBySlug(slug: string, options?: {populate?: boolean; select?: string}) {
    const product = await this.repository.getProductBySlug(slug, options);
    if (!product) {
      throw new AppError(productControllerTranslate[lang].errors.noProductFoundWithId, 404);
    }
    return product;
  }
  async getProductMetaDataBySlug(slug: string) {
    //return await this.repository.getProductMetaDataBySlug(slug);
    const product = await this.repository.getProductMetaDataBySlug(slug);
    if (!product) {
      throw new AppError(productControllerTranslate[lang].errors.noProductFoundWithId, 404);
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
    actorId: CreateProductDto['userId'],
    logs: LogsTypeDto,
  ) {
    const session = await this.repository.startSession();
    session.startTransaction();
    try {
      const product = await this.repository.getProductBySlug(slug, undefined, session);
      if (!product) {
        throw new AppError(productControllerTranslate[lang].errors.noProductFoundWithId, 404);
      }

      // Filter images to delete
      const imagesToDelete = product.images.filter((image) => public_id.includes(image.public_id));

      // Delete images from Cloudinary
      for (const image of imagesToDelete) {
        await destroyImage(image.public_id);
      }

      // Remove deleted images from the document
      product.images = product.images.filter((image) => !public_id.includes(image.public_id));
      await this.repository.updateProductImages(
        product._id.toString(),
        product.images,
        actorId,
        session,
      );
      const changes = imagesToDelete.map((image) => ({
        field: 'images',
        before: image,
        after: undefined,
        changeType: 'REMOVE' as const,
      }));

      await this.logAction(
        AuditAction.IMAGE_REMOVE, // Fixed action type
        product.slug,
        actorId,
        changes,
        logs.ipAddress,
        logs.userAgent,
        logs.source as AuditSource, // Add source to LogsTypeDto
        session,
      );

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
    // await product.save();
  }
  validateBase64Image(image: string): void {
    // Split the base64 string into the prefix and the data
    const [prefix, data] = image.split(',');

    // Check the file type from the prefix (e.g., 'data:image/jpeg;base64')
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
    const mimeTypeMatch = prefix.match(/data:(.*?);base64/);

    // Add a null check for mimeTypeMatch
    if (!mimeTypeMatch || !mimeTypeMatch[1]) {
      throw new AppError(
        productControllerTranslate[lang].functions.validateBase64Image.invalidImageFormat,
        400,
      );
    }

    const mimeType = mimeTypeMatch[1];

    if (!allowedTypes.includes(mimeType)) {
      throw new AppError(
        productControllerTranslate[lang].functions.validateBase64Image.invalidImageType,
        400,
      );
    }

    // Calculate the size of the image in bytes
    const imageSizeInBytes = (data.length * 3) / 4;
    const imageSizeInMB = imageSizeInBytes / (1024 * 1024);

    if (imageSizeInMB > 2) {
      throw new AppError(
        productControllerTranslate[lang].functions.validateBase64Image.imageSizeExceeds,
        400,
      );
    }
  }
  async getTopOffersAndNewProducts() {
    return await this.repository.getTopOffersAndNewProducts();
  }
  async toggleProductActivity(slug: string, userId: CreateProductDto['userId']) {
    return await this.repository.toggleProductActivity(slug, userId);
  }
  async getProductHistory(
    slug: string,
    options: QueryOptionConfig,
    versionId?: string,
  ): Promise<QueryBuilderResult<IAuditLog>> {
    const queryConfig: QueryBuilderConfig<IAuditLog> = {
      allowedFilters: ['entityType', 'entityId', 'actor', 'action', 'createdAt'],

      allowedSorts: ['createdAt', 'updatedAt'],
    };

    //   allowedSorts: ["createdAt", "updatedAt"] as Array<keyof IWishlist>,
    //   maxLimit: 100,
    const query = new URLSearchParams({
      ...options.query,
      entityType: EntityType.PRODUCT,
      entityId: slug,
    });

    if (versionId) {
      const targetVersion = await AuditLogModel.findById(versionId);
      if (!targetVersion) throw new AppError('Invalid version', 400);
      query.append('createAt[lte]', targetVersion.createdAt.toISOString());
    }
    const queryBuilder = new QueryBuilder<IAuditLog>(AuditLogModel, query, queryConfig);

    if (options?.populate) {
      queryBuilder.populate([{path: 'actor', select: 'name email'}]);
    }

    const logs = await queryBuilder.execute();

    return this.reconstructProduct(logs);
  }

  private reconstructProduct(
    logsResult: QueryBuilderResult<IAuditLog>,
  ): QueryBuilderResult<IAuditLog> {
    let product: any = {};
    const reconstructedVersions: any[] = [];

    for (const log of logsResult.docs) {
      switch (log.action) {
        case AuditAction.CREATE:
          log.changes.forEach((change) => {
            if (change.changeType === 'ADD') {
              product[change.field] = change.after;
            }
          });
          break;

        case AuditAction.UPDATE:
          log.changes.forEach((change) => {
            product[change.field] = change.after;
          });
          break;

        case AuditAction.DELETE:
          product = null;
          break;

        case AuditAction.RESTORE:
          product = log.changes[0]?.after || {};
          break;

        case AuditAction.IMAGE_ADD:
          product.images = product.images || [];
          log.changes.forEach((change) => {
            product.images.push(change.after);
          });
          break;

        case AuditAction.IMAGE_REMOVE:
          product.images = (product.images || []).filter(
            (img: any) => !log.changes.some((c) => c.before.public_id === img.public_id),
          );
          break;
      }

      // Save snapshot at each version
      reconstructedVersions.push({
        ...product,
        versionId: log._id,
        timestamp: log.createdAt,
      });
    }

    return {
      ...logsResult,
      docs: reconstructedVersions, // Return product versions with pagination
    };
  }
  async restoreProductVersion(
    slug: string,
    versionId: string,
    actorId: Types.ObjectId,
    logs: LogsTypeDto,
  ): Promise<IProduct> {
    const session = await this.repository.startSession();
    session.startTransaction();

    try {
      // Get current product first to ensure it exists
      const currentProduct = await this.repository.getProductBySlug(slug);
      if (!currentProduct) {
        throw new AppError(productControllerTranslate[lang].errors.noProductFoundWithId, 404);
      }

      // Get historical version data using product ID
      const historicalData = await this.getProductHistory(
        slug,
        {query: new URLSearchParams()}, // Default query options
        versionId,
      );

      if (!historicalData.docs.length) {
        throw new AppError(productControllerTranslate[lang].errors.HistoricalProductNotFound, 404);
      }

      // Get the reconstructed product version
      const productVersion = historicalData.docs[0] as unknown as IProduct;

      // Prepare update payload, filtering out null, undefined, or empty values
      const updatePayload: Partial<IProduct> = {
        name: productVersion.name || undefined,
        price: productVersion.price ?? undefined,
        discount: productVersion.discount ?? undefined,
        stock: productVersion.stock ?? undefined,
        description: productVersion.description || undefined,
      };

      // Remove keys that are still `undefined`
      Object.keys(updatePayload).forEach(
        (key) =>
          updatePayload[key as keyof IProduct] === undefined &&
          delete updatePayload[key as keyof IProduct],
      );
      // Perform update
      const updatedProduct = await this.repository.update(slug, updatePayload, session);

      // Log restoration action with proper entity ID
      await this.logAction(
        AuditAction.RESTORE,
        currentProduct.slug, // Use ObjectId instead of slug
        actorId,
        this.getUpdateChanges(currentProduct, updatedProduct!),
        logs.ipAddress,
        logs.userAgent,
        logs.source as AuditSource, // Add source to LogsTypeDto
        session,
      );

      await session.commitTransaction();
      return updatedProduct!;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }
}
/**   topOfferProducts: products[0].topOfferProducts,
      newProducts: products[0].newProducts,
      topRating: products[0].topRating, */
// export default new ProductService();
// Compare this snippet from shop/app/_server/repositories/user.repository.ts:
