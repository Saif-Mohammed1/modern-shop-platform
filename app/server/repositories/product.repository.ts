// product.repository.ts
import type { Knex } from "knex";

import {
  EntityType,
  AuditAction,
  AuditSource,
  type IAuditLogChangesDB,
  type IGAuditLogDB,
} from "@/app/lib/types/audit.db.types";
import type {
  IProductDB,
  IProductImagesDB,
  IProductShoppingInfoDB,
  IProductViewBasicDB,
  IProductViewDB,
} from "@/app/lib/types/products.db.types";
import type {
  QueryBuilderConfig,
  QueryBuilderResult,
  QueryOptionConfig,
} from "@/app/lib/types/queryBuilder.types";
import AppError from "@/app/lib/utilities/appError";
import { generateSKU, generateSlug } from "@/app/lib/utilities/helpers";
import { generateUUID } from "@/app/lib/utilities/id";
import { QueryBuilder } from "@/app/lib/utilities/queryBuilder";

import type { CreateProductDto, UpdateProductDto } from "../dtos/product.dto";

import { BaseRepository } from "./BaseRepository";

export class ProductRepository extends BaseRepository<IProductDB> {
  private productViewBase = "public_products_views_basic";
  constructor(knex: Knex) {
    super(knex, "products");
    // super(knex, "products");
  }
  async createProduct(
    dto: Omit<CreateProductDto, "images"> & {
      images: {
        link: string;
        public_id: string;
      }[];
    },
    trx?: Knex.Transaction
  ): Promise<IProductDB> {
    if (!dto.sku) {
      dto.sku = generateSKU(dto.category);
    }
    const query = trx ?? this.knex;

    const product_id = generateUUID();
    const slug = await generateSlug(dto.name, query, this.tableName);
    const productData: Omit<
      IProductDB,
      "created_at" | "updated_at" | "ratings_average" | "ratings_quantity"
    > = {
      _id: product_id,
      name: dto.name,
      category: dto.category,
      price: dto.price,
      discount: dto.discount ?? 0,
      user_id: dto.user_id,
      description: dto.description,
      stock: dto.stock,
      active: dto.active ?? true,
      slug: slug,
      reserved: dto.reserved,
      sold: dto.sold,
      sku: dto.sku,
      last_modified_by: dto.user_id,
      discount_expire: dto.discount_expire,
    };
    const shoppingInfo: IProductShoppingInfoDB = {
      product_id: product_id,
      weight: dto.shipping_info.weight,
      height: dto.shipping_info.dimensions.height,
      length: dto.shipping_info.dimensions.length,
      width: dto.shipping_info.dimensions.width,
    };
    const productImages: Omit<IProductImagesDB, "created_at">[] =
      dto.images.map((image) => ({
        link: image.link,
        public_id: image.public_id,
        product_id: product_id,
        _id: generateUUID(),
      }));

    const [product] = await this.query(trx).insert(productData).returning("*");
    await Promise.all([
      query<IProductImagesDB>("product_images").insert(productImages),
      query<IProductShoppingInfoDB>("product_shopping_info").insert(
        shoppingInfo
      ),
    ]);

    return product;
  }
  override async update(
    slug: string,
    dto: Omit<UpdateProductDto, "images"> & {
      product_id: string;
      images?: {
        link: string;
        public_id: string;
      }[];
    } & { actorId?: IProductDB["user_id"] },
    trx?: Knex.Transaction
  ): Promise<IProductDB | null> {
    if (!dto.sku) {
      dto.sku = generateSKU(dto.category);
    }
    if (dto.images) {
      const query = trx ?? this.knex;
      const productImages: Omit<IProductImagesDB, "created_at">[] =
        dto.images.map((image) => ({
          link: image.link,
          public_id: image.public_id,
          product_id: dto.product_id,
          _id: generateUUID(),
        }));
      await query<IProductImagesDB>("product_images").insert(productImages);
    }
    const cleanedData = this.cleanedUpdates({
      // _id: dto.product_id,
      name: dto.name,
      category: dto.category,
      price: dto.price,
      discount: dto.discount,
      user_id: dto.user_id,
      description: dto.description,
      stock: dto.stock,
      active: dto.active,
      slug: slug,
      reserved: dto.reserved,
      sold: dto.sold,
      sku: dto.sku,
      last_modified_by: dto.user_id,
      discount_expire: dto.discount_expire,
    });
    const [product] = await this.query(trx)
      .where("slug", slug)
      .update(cleanedData)
      .returning("*");
    return product;
  }

  async logAction(
    action: AuditAction,
    entityId: string,
    actor: string,
    changes: Omit<IAuditLogChangesDB, "_id" | "created_at" | "audit_log_id">[],
    source: AuditSource = AuditSource.WEB,
    trx?: Knex.Transaction
  ) {
    const query = trx ?? this.knex;
    const auditLogId = generateUUID();
    const correlationId = generateUUID();
    await query<IGAuditLogDB>("audit_logs").insert({
      _id: auditLogId,
      actor,
      action,
      entity_type: EntityType.PRODUCT,
      entity_id: entityId,
      source,
      correlation_id: correlationId,
      // context: {
      //   changes,
      // },
    });

    const changeData = changes.map((change) => ({
      _id: generateUUID(),
      audit_log_id: auditLogId,
      field: change.field,
      before: this.safeJson(change.before),
      after: this.safeJson(change.after),
      change_type: change.change_type,
    }));
    await query<IAuditLogChangesDB>("audit_log_changes").insert(changeData);
  }

  async getProducts(
    options: QueryOptionConfig
    // isAdmin?: boolean
  ): Promise<QueryBuilderResult<IProductViewBasicDB>> {
    const queryConfig: QueryBuilderConfig<IProductViewBasicDB> = {
      allowedFilters: [
        "name",
        "price",
        "category",
        "slug",
        "created_at", // Fixed typo from 'createAt'
        "ratings_average",
        "description",
      ],
      filterMap: {
        rating: "ratings_average",
      },
      searchFields: ["name", "description"],
      // select: ["users"],

      enableFullTextSearch: true,
      allowedSorts: ["created_at", "price", "ratings_average"],
    };

    const queryBuilder = new QueryBuilder<IProductViewBasicDB>(
      this.knex,
      this.productViewBase,
      options.query,
      queryConfig
      // true
    );

    if (options?.populate) {
      // queryBuilder.join({
      //   table: "users",
      //   type: "left",
      //   on: { left: "user_id", right: "_id" },
      //   select: ["name"],
      // });
    }

    return await queryBuilder.execute();
  }

  async getProductBySlug(
    slug: string,
    options?: {
      populate?: boolean; //select?: string
    },
    trx?: Knex.Transaction
  ): Promise<IProductViewDB | IProductViewBasicDB | null> {
    const segment = slug.replace(/^\(\.\)/, "");
    const query = (trx ?? this.knex)<IProductViewDB | IProductViewBasicDB>(
      this.productViewBase
    ).where("slug", segment);

    if (options?.populate) {
      query
        .leftJoin(
          "reviews",
          `${this.productViewBase}._id`,
          "reviews.product_id"
        )
        .leftJoin("users", "reviews.user_id", "users._id")
        .select(
          `${this.productViewBase}._id`,
          `${this.productViewBase}.name`,
          `${this.productViewBase}.category`,
          `${this.productViewBase}.price`,
          `${this.productViewBase}.discount`,
          `${this.productViewBase}.discount_expire`,
          `${this.productViewBase}.description`,
          `${this.productViewBase}.stock`,
          `${this.productViewBase}.ratings_average`,
          `${this.productViewBase}.ratings_quantity`,
          `${this.productViewBase}.reserved`,
          `${this.productViewBase}.sold`,
          `${this.productViewBase}.sku`,
          `${this.productViewBase}.created_at`,
          this.knex.raw(`MIN(${this.productViewBase}.images::text) as images`),
          this.knex.raw(
            `MIN(${this.productViewBase}.shipping_info::text) as shipping_info`
          ),
          this.knex.raw(`
            COALESCE(
              json_agg(
                json_build_object(
                  '_id', reviews._id,
                  'rating', reviews.rating,
                  'comment', reviews.comment,
                  'created_at', reviews.created_at,
                  'user_name', users.name
                )
              ) FILTER (WHERE reviews._id IS NOT NULL),
              '[]'
            ) as reviews
          `)
        )

        .groupBy(
          `${this.productViewBase}._id`,
          `${this.productViewBase}.name`,
          `${this.productViewBase}.category`,
          `${this.productViewBase}.price`,
          `${this.productViewBase}.discount`,
          `${this.productViewBase}.discount_expire`,
          `${this.productViewBase}.description`,
          `${this.productViewBase}.stock`,
          `${this.productViewBase}.ratings_average`,
          `${this.productViewBase}.ratings_quantity`,
          `${this.productViewBase}.slug`,
          `${this.productViewBase}.created_at`,
          `${this.productViewBase}.reserved`,
          `${this.productViewBase}.sold`,
          `${this.productViewBase}.sku`

          // `${this.productViewBase}.images`,
          // `${this.productViewBase}.shipping_info`
        );

      /**    "products._id",
        "products.name",
        "products.category",
        "products.price",
        "products.discount",
        "products.discount_expire",
        "products.description",
        "products.stock",
        "products.ratings_average",
        "products.ratings_quantity",
        "products.slug",
        "products.created_at", 
        "products.images",
        "products.shipping_info",*/
    }

    const result = await query.first();
    if (!result) {
      return null;
    }
    if (typeof result.images === "string") {
      result.images = JSON.parse(result.images);
    }
    if (typeof result.shipping_info === "string") {
      result.shipping_info = JSON.parse(result.shipping_info);
    }
    return result || null;
  }

  async getProductMetaDataBySlug(
    slug: string,
    trx?: Knex.Transaction
  ): Promise<IProductViewBasicDB | null> {
    const segment = slug.replace(/^\(\.\)/, "");
    const query = (trx ?? this.knex)<IProductViewBasicDB>(this.productViewBase);

    return (await query.where("slug", segment).first()) ?? null;
  }
  async toggleProductActivity(
    slug: string,
    actorId: IProductDB["user_id"],
    trx?: Knex.Transaction
  ): Promise<void> {
    await this.query(trx)
      .where("slug", slug)
      .update({
        active: this.knex.raw("NOT ??", ["active"]),

        last_modified_by: actorId,
      });
  }

  async getProductsByCategory(
    category: string
  ): Promise<IProductViewBasicDB[]> {
    const query = this.knex<IProductViewBasicDB>(this.productViewBase);

    return await query.where("category", category).limit(10); //.lean();
  }

  async getCategoryList(): Promise<string[]> {
    const result = await this.query().distinct("category").select("category");
    return result.map((row) => row.category);
  }

  async getTopOffersAndNewProducts(): Promise<{
    topOfferProducts: IProductViewBasicDB[];
    newProducts: IProductViewBasicDB[];
    topRating: IProductViewBasicDB[];
  }> {
    const query = this.knex<IProductViewBasicDB>(this.productViewBase);

    const [topOfferProducts, newProducts, topRating] = await Promise.all([
      query
        .clone()
        .where("discount", ">", 0)

        .orderBy("discount", "desc")
        .limit(20),

      query
        .clone()

        .orderBy("created_at", "desc")
        .limit(20),

      query
        .clone()
        .where("ratings_average", ">=", 3.0)
        .orderBy("ratings_average", "desc")
        .limit(20),
    ]);

    return {
      topOfferProducts,
      newProducts,
      topRating,
    };
  }

  // private publicProduct(trx?: Knex.Transaction): Knex.QueryBuilder {
  //   return (trx ?? this.knex)<IProductViewDB>("public_products_views");
  // }

  async deleteProductImages(
    publicId: string,
    trx?: Knex.Transaction
  ): Promise<boolean> {
    const query = trx ?? this.knex;
    return await query<IProductImagesDB>("product_images")
      .where("public_id", publicId)
      // .andWhere("product_id", img.product_id)
      .del();
  }
  async getProductHistory(
    slug: string,
    options: QueryOptionConfig,
    versionId?: string
  ): Promise<QueryBuilderResult<IGAuditLogDB>> {
    const queryConfig: QueryBuilderConfig<IGAuditLogDB> = {
      allowedFilters: [
        "entity_type",
        "entity_id",
        "actor",
        "action",
        "created_at",
      ],
      allowedSorts: ["created_at", "updated_at"],
    };

    //   allowedSorts: ["created_at", "updated_at"] as Array<keyof IWishlist>,
    //   maxLimit: 100,
    const query = new URLSearchParams({
      ...options.query,
      entity_type: EntityType.PRODUCT,
      entity_id: slug,
    });

    if (versionId) {
      const targetVersion = await this.knex<IGAuditLogDB>("audit_logs")
        .where("_id", versionId)
        .first();
      if (!targetVersion) {
        throw new AppError("Invalid version", 400);
      }
      query.append("create_at[lte]", targetVersion.created_at.toISOString());
    }
    const queryBuilder = new QueryBuilder<IGAuditLogDB>(
      this.knex,
      "audit_logs",
      query,
      queryConfig
    ).join({
      table: "audit_log_changes",
      alias: "changes",
      type: "left",
      on: { left: "_id", right: "audit_log_id" },
      select: [],
      outerKey: "changes",
    });

    if (options?.populate) {
      queryBuilder.join({
        table: "users",
        type: "left",
        on: { left: "actor", right: "_id" },
        select: ["name", "email"],
      });
    }

    const logs = await queryBuilder.execute();

    // Ensure logs include changes by grouping and selecting changes
    // logs.docs = await Promise.all(
    //   logs.docs.map(async (log) => {
    //     const changes = await this.knex<IAuditLogChangesDB>("audit_log_changes")
    //       .where("audit_log_id", log._id)
    //       .select("*");
    //     return { ...log, changes };
    //   })
    // );

    return this.reconstructProduct(
      logs as QueryBuilderResult<
        IGAuditLogDB & { changes: IAuditLogChangesDB[] }
      >
    );
  }
  private reconstructProduct(
    logsResult: QueryBuilderResult<
      IGAuditLogDB & { changes: IAuditLogChangesDB[] }
    >
  ): QueryBuilderResult<IGAuditLogDB & { changes: IAuditLogChangesDB[] }> {
    let product: Record<string, any> = {};
    const reconstructedVersions: any[] = [];

    for (const log of logsResult.docs) {
      switch (log.action) {
        case AuditAction.CREATE:
          log.changes.forEach((change) => {
            if (change.change_type === "ADD") {
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
          product = {};
          break;

        case AuditAction.RESTORE:
          product = log.changes[0]?.after || {};
          break;

        case AuditAction.IMAGE_ADD:
          product.images = product.images || [];
          log.changes.forEach((change) => {
            (product.images as Array<{ link: string; public_id: string }>).push(
              change.after
            );
          });
          break;

        case AuditAction.IMAGE_REMOVE:
          product.images = (
            (product.images as Array<{ link: string; public_id: string }>) || []
          ).filter(
            (img) =>
              !log.changes.some(
                (c: { before?: { public_id: string } }) =>
                  c.before && c.before.public_id === img.public_id
              )
          );
          break;
      }

      // Save snapshot at each version
      reconstructedVersions.push({
        ...product,
        versionId: log._id,
        timestamp: log.created_at,
      });
    }

    return {
      ...logsResult,
      docs: reconstructedVersions, // Return product versions with pagination
    };
  }
}
