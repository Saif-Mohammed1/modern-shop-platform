// product.repository.ts
import {
  QueryBuilderConfig,
  QueryBuilderResult,
  QueryOptionConfig,
} from "@/app/lib/types/queryBuilder.types";
import { QueryBuilder } from "@/app/lib/utilities/queryBuilder";
import { ClientSession, Model } from "mongoose";
import { BaseRepository } from "./BaseRepository";
import { IProduct } from "../models/Product.model";
import { CreateProductDto, UpdateProductDto } from "../dtos/product.dto";
import { generateSKU } from "@/app/lib/utilities/helpers";
import ReviewModel from "../models/Review.model";

export class ProductRepository extends BaseRepository<IProduct> {
  constructor(model: Model<IProduct>) {
    super(model);
  }
  async create(
    dto: CreateProductDto,
    session?: ClientSession
  ): Promise<IProduct> {
    if (!dto.sku) {
      dto.sku = generateSKU(dto.category);
    }

    dto.active = dto.active ?? true;

    const [product] = await this.model.create([dto], {
      session,
    });
    return product;
  }
  async update(
    id: string,
    dto: UpdateProductDto,
    session?: ClientSession
  ): Promise<IProduct | null> {
    if (!dto.sku) {
      dto.sku = generateSKU(dto.category);
    }

    const product = await this.model.findByIdAndUpdate(
      id,
      { $set: dto },
      { new: true, session }
    );
    return product;
  }
  async delete(id: string, session?: ClientSession): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id, { session });
    return result !== null;
  }
  async getProducts(
    options: QueryOptionConfig,
    isAdmin?: boolean
  ): Promise<QueryBuilderResult<IProduct> | []> {
    const queryConfig: QueryBuilderConfig<IProduct> = {
      allowedFilters: [
        "name",
        "price",
        "category",
        "slug",
        "createdAt", // Fixed typo from 'createAt'
        "ratingsAverage",
        isAdmin && "active",
      ].filter(Boolean) as Array<keyof IProduct>,
      filterMap: {
        rating: "ratingsAverage",
      },
      allowedSorts: ["createdAt", "updatedAt", "price"] as Array<
        keyof IProduct
      >,
      fixedFilters: !isAdmin ? { active: true } : undefined,
    };

    //   allowedSorts: ["createdAt", "updatedAt"] as Array<keyof IWishlist>,
    //   maxLimit: 100,

    const queryBuilder = new QueryBuilder<IProduct>(
      this.model,
      options.query,
      queryConfig
    );
    // this work around is to prevent non-admin users from seeing inactive products
    // and this work too
    //  fixedFilters: !isAdmin ? { active: true } : undefined,

    // if (!isAdmin) queryBuilder.filter.active = true;

    if (options?.populate) {
      queryBuilder.populate([{ path: "userId", select: "name " }]);
    }

    return queryBuilder.execute();
  }
  async getProductBySlug(slug: string): Promise<IProduct | null> {
    return await this.model
      .findOne({ slug, active: true })
      .populate({
        path: "reviews",
        select: "rating comment userId createdAt",
        options: { sort: { createdAt: -1 }, limit: 5 }, // Ensure sorting & limiting
        model: ReviewModel,
      })
      .lean({ virtuals: true }); // This ensures virtuals are included
  }
  async getProductMetaDataBySlug(slug: string): Promise<IProduct | null> {
    return await this.model
      .findOne({ slug, active: true })

      .lean(); // This ensures virtuals are included
  }

  async getProductsByCategory(category: string): Promise<IProduct[]> {
    return this.model.find({ category, active: true }).limit(10).lean();
  }
  async getProductsByCategoryAndSlug(
    category: string,
    slug: string
  ): Promise<IProduct | null> {
    return await this.model
      .findOne({ category, slug, active: true })
      .populate("reviews")
      .lean();
  }
  async startSession() {
    return await this.model.db.startSession();
  }
  async getCategoryList(): Promise<string[]> {
    return await this.model.distinct("category");
  }
  async getTopOffersAndNewProducts() {
    return await this.model.aggregate([
      {
        $facet: {
          // Top Offer Products - Sorted by highest discount and rating, filtered by stock and minimum rating
          topOfferProducts: [
            {
              $match: {
                discount: { $gt: 0 }, // Ensure there's a discount
                stock: { $gt: 0 }, // Ensure the product is in stock
                // ratingsAverage: { $gte: .0 }, // Minimum rating of 4.0
              },
            },
            {
              $sort: { discount: -1 }, //ratingsAverage: -1 }, // Sort by discount first, then rating
            },
            {
              $limit: 20, // Limit to top 20 offer products
            },
          ],
          // New Products - Sorted by creation date and optionally filtered by rating
          newProducts: [
            {
              $match: {
                stock: { $gt: 0 }, // Only show products in stock
                // ratingsAverage: { $gte: 4.0 }, // Optional: Minimum rating of 4.0
              },
            },
            {
              $sort: { createdAt: -1 }, //ratingsAverage: -1 }, // Sort by creation date, then rating
            },
            {
              $limit: 20, // Limit to 20 new products
            },
          ],
          // Top Rating Products - Get products with ratings greater than or equal to 3 stars
          topRating: [
            {
              $match: {
                ratingsAverage: { $gte: 3.0 }, // Minimum rating of 3.0
                stock: { $gt: 0 }, // Only show products in stock
              },
            },
            {
              $sort: { ratingsAverage: -1 }, // Sort by rating (highest to lowest)
            },
            {
              $limit: 20, // Limit to top 20 products with the best ratings
            },
          ],
        },
      },
    ]);
  }
}
