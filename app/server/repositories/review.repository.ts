import type { Knex } from "knex";

import type { IReviewDB } from "@/app/lib/types/products.db.types";
import type {
  QueryBuilderConfig,
  QueryBuilderResult,
  QueryOptionConfig,
} from "@/app/lib/types/queryBuilder.types";
import { QueryBuilder } from "@/app/lib/utilities/queryBuilder";
import { redis } from "@/app/lib/utilities/Redis";

import { BaseRepository } from "./BaseRepository";

interface RatingDistribution {
  "1": number;
  "2": number;
  "3": number;
  "4": number;
  "5": number;
}
interface RatingRow {
  rating: number;
  count: number;
}

export class ReviewRepository extends BaseRepository<IReviewDB> {
  constructor(knex: Knex) {
    super(knex, "reviews");
  }

  async findByProduct(
    product_id: string,
    options: QueryOptionConfig
  ): Promise<QueryBuilderResult<IReviewDB>> {
    const queryConfig: QueryBuilderConfig<IReviewDB> = {
      allowedFilters: ["user_id", "product_id", "created_at"],
      //   allowedSorts: ["created_at", "updated_at"] as Array<keyof IWishlist>,
      //   maxLimit: 100,
    };

    const searchParams = new URLSearchParams({
      ...Object.fromEntries(options.query.entries()),
      product_id: product_id,
      // ...(options?.page && { page: options.page.toString() }),
      // ...(options?.limit && { limit: options.limit.toString() }),
      // ...(options?.sort && { sort: options.sort }),
    });

    const queryBuilder = new QueryBuilder<IReviewDB>(
      this.knex,
      this.tableName,
      searchParams,
      queryConfig
    );

    if (options?.populate) {
      queryBuilder.join({
        table: "products",
        type: "left",
        on: { left: "product_id", right: "_id" },
        select: ["name", "slug"],
        // queryBuilder.join([{ path: "product_id", select: "name slug" }]);
      });
    }

    return await queryBuilder.execute();
  }
  async findByProductAndUser(
    product_id: IReviewDB["product_id"],
    user_id: IReviewDB["user_id"]
  ): Promise<IReviewDB | null> {
    return (
      (await this.query()
        .where("user_id", user_id)
        .where("product_id", product_id)
        .first()) ?? null
    );
  }

  async getRatingDistribution(): Promise<number[]> {
    const cacheKey = "rating_distribution";
    const cached = await redis.get(cacheKey);
    if (typeof cached === "string") {
      return JSON.parse(cached) as number[];
    }

    const distribution = (await this.query()
      .select(
        this.knex.raw("ROUND(rating) as rating"),
        this.knex.raw("COUNT(*) as count")
      )
      .groupByRaw("ROUND(rating)")
      .orderBy("rating", "asc")) as unknown as RatingRow[];

    const ratings = [0, 0, 0, 0, 0];
    distribution.forEach(({ rating, count }) => {
      const ratingIndex = Number(rating) - 1;
      if (ratingIndex >= 0 && ratingIndex < 5) {
        ratings[ratingIndex] = Number(count);
      }
    });

    await redis.setex(cacheKey, 3600, JSON.stringify(ratings)); // Cache for 1 hour
    return ratings;
  }

  async getRatingDistributionByProductId(
    product_id: string
  ): Promise<RatingDistribution> {
    const cacheKey = `rating_distribution_${product_id}`;
    const cached = await redis.get(cacheKey);
    if (typeof cached === "string") {
      return JSON.parse(cached) as RatingDistribution;
    }

    const raw = await this.query()
      .select(this.knex.raw("ROUND(rating)::int as rating"))
      .count("* as count")
      .where("product_id", product_id)
      .groupByRaw("ROUND(rating)::int")
      .orderBy("rating", "asc");
    const rows = raw as unknown as RatingRow[];

    const defaultDistribution: RatingDistribution = {
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0,
    };

    const result = { ...defaultDistribution };

    for (const row of rows) {
      result[row.rating.toString() as keyof RatingDistribution] = Number(
        row.count
      );
    }

    await redis.setex(cacheKey, 3600, JSON.stringify(result)); // Cache for 1 hour
    return result;
  }
  async getMyReviews(
    user_id: string,
    options: QueryOptionConfig
  ): Promise<QueryBuilderResult<IReviewDB>> {
    const queryConfig: QueryBuilderConfig<IReviewDB> = {
      allowedFilters: ["user_id", "product_id", "created_at"],
      //   allowedSorts: ["created_at", "updated_at"] as Array<keyof IWishlist>,
      //   maxLimit: 100,
      selectFields: [
        "_id",
        "user_id",
        "product_id",
        "rating",
        "comment",
        "created_at",
        // "this.knex.raw(`TO_CHAR(created_at, 'DD/MM/YYYY') AS created_at`)",
      ],
      dateFormatFields: {
        created_at: "DD/MM/YYYY",
      },
      totalCountBy: ["user_id"],
      excludeLinksFields: ["reviews.user_id", "user_id"],
    };

    const searchParams = new URLSearchParams({
      ...Object.fromEntries(options.query.entries()),
      // user_id: user_id,
      // ...(options?.page && { page: options.page.toString() }),
      // ...(options?.limit && { limit: options.limit.toString() }),
      // ...(options?.sort && { sort: options.sort }),
    });
    searchParams.set(`reviews.user_id`, user_id);
    const queryBuilder = new QueryBuilder<IReviewDB>(
      this.knex,
      this.tableName,
      searchParams,
      queryConfig
    );

    if (options?.populate) {
      queryBuilder.join({
        table: "products",
        type: "left",
        on: { left: "product_id", right: "_id" },

        select: ["name", "slug"],
        outerKey: "product_id",
      });
    }

    return await queryBuilder.execute();
  }
}
