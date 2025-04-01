import type { ClientSession } from "mongoose";
import { BaseRepository } from "./BaseRepository";
import { Model } from "mongoose";
import { assignAsObjectId } from "@/app/lib/utilities/assignAsObjectId";
import type {
  QueryBuilderConfig,
  QueryBuilderResult,
  QueryOptionConfig,
} from "@/app/lib/types/queryBuilder.types";
import { QueryBuilder } from "@/app/lib/utilities/queryBuilder";
import type { IReview } from "../models/Review.model";
import type { createReviewDto } from "../dtos/reviews.dto";

export class ReviewRepository extends BaseRepository<IReview> {
  constructor(model: Model<IReview>) {
    super(model);
  }
  override async create(
    data: createReviewDto,
    session?: ClientSession
  ): Promise<IReview> {
    const [review] = await this.model.create([data], { session });
    return review;
  }

  override async findById(id: IReview["_id"]): Promise<IReview | null> {
    return await this.model.findById(id).lean();
  }

  async findByProduct(
    productId: string,
    options: QueryOptionConfig
  ): Promise<QueryBuilderResult<IReview>> {
    const queryConfig: QueryBuilderConfig<IReview> = {
      allowedFilters: ["userId", "productId", "createdAt"],
      //   allowedSorts: ["createdAt", "updatedAt"] as Array<keyof IWishlist>,
      //   maxLimit: 100,
    };

    const searchParams = new URLSearchParams({
      ...Object.fromEntries(options.query.entries()),
      productId,
      // ...(options?.page && { page: options.page.toString() }),
      // ...(options?.limit && { limit: options.limit.toString() }),
      // ...(options?.sort && { sort: options.sort }),
    });

    const queryBuilder = new QueryBuilder<IReview>(
      this.model,
      searchParams,
      queryConfig
    );

    if (options?.populate) {
      queryBuilder.populate([{ path: "productId", select: "name slug" }]);
    }

    return await queryBuilder.execute();
  }
  async findByProductAndUser(
    productId: IReview["productId"],
    userId: IReview["userId"]
  ): Promise<IReview | null> {
    return await this.model.findOne({ productId, userId }).lean();
  }
  override async update(
    id: IReview["_id"],
    input: Partial<IReview>,
    session?: ClientSession
  ): Promise<IReview | null> {
    return await this.model
      .findByIdAndUpdate(id, input, { new: true, session })
      .lean();
  }

  async deleteReview(
    id: IReview["_id"],
    session?: ClientSession
  ): Promise<void> {
    await this.model.findByIdAndDelete(id, { session });
  }
  async getRatingDistribution(): Promise<number[]> {
    const distribution = await this.model.aggregate([
      {
        $group: {
          _id: { $round: ["$rating", 0] }, // Round rating to nearest int (1-5)
          count: { $sum: 1 }, // Count occurrences
        },
      },
      {
        $sort: { _id: 1 }, // Ensure sorting from 1-star to 5-star
      },
    ]);

    const ratings = [0, 0, 0, 0, 0]; // Default 0 for all ratings

    distribution.forEach(({ _id, count }) => {
      ratings[_id - 1] = count; // Store count at correct index
    });

    return ratings;
  }

  async getRatingDistributionByProductId(productId: string): Promise<{
    [key: string]: number;
  }> {
    // const distribution = await this.model.aggregate([
    //   {
    //     $match: {
    //       productId: assignAsObjectId(productId),
    //       // rating: { $exists: true, $ne: null },
    //     },
    //   },
    //   {
    //     $group: {
    //       _id: { $round: ["$rating", 0] }, // Round rating to nearest int (1-5)
    //       count: { $sum: 1 }, // Count occurrences
    //     },
    //   },
    //   {
    //     $sort: { _id: 1 }, // Ensure sorting from 1-star to 5-star
    //   },
    // ]);
    // const ratings = [0, 0, 0, 0, 0]; // Default 0 for all ratings
    // distribution.forEach(({ _id, count }) => {
    //   ratings[_id - 1] = count; // Store count at correct index
    // });
    // return ratings;
    const distribution = await this.model.aggregate([
      {
        $match: { productId: assignAsObjectId(productId) },
      },
      {
        $group: {
          _id: { $round: ["$rating", 0] }, // Round rating (1-5)
          count: { $sum: 1 }, // Count occurrences
        },
      },
      {
        $sort: { _id: 1 }, // Sort from 1-star to 5-star
      },
      {
        $group: {
          _id: null,
          ratings: { $push: { k: { $toString: "$_id" }, v: "$count" } }, // Convert _id to string keys
        },
      },
      {
        $set: {
          distribution: {
            $arrayToObject: {
              $concatArrays: [
                [
                  { k: "1", v: 0 },
                  { k: "2", v: 0 },
                  { k: "3", v: 0 },
                  { k: "4", v: 0 },
                  { k: "5", v: 0 },
                ],
                "$ratings",
              ],
            },
          },
        },
      },
      {
        $project: { _id: 0, distribution: 1 }, // Remove _id
      },
    ]);

    return (
      distribution[0]?.distribution || {
        "1": 0,
        "2": 0,
        "3": 0,
        "4": 0,
        "5": 0,
      }
    );
  }

  async getMyReviews(
    userId: string,
    options: QueryOptionConfig
  ): Promise<QueryBuilderResult<IReview>> {
    const queryConfig: QueryBuilderConfig<IReview> = {
      allowedFilters: ["userId", "productId", "createdAt"],
      //   allowedSorts: ["createdAt", "updatedAt"] as Array<keyof IWishlist>,
      //   maxLimit: 100,
    };

    const searchParams = new URLSearchParams({
      ...Object.fromEntries(options.query.entries()),
      userId,
      // ...(options?.page && { page: options.page.toString() }),
      // ...(options?.limit && { limit: options.limit.toString() }),
      // ...(options?.sort && { sort: options.sort }),
    });

    const queryBuilder = new QueryBuilder<IReview>(
      this.model,
      searchParams,
      queryConfig
    );

    if (options?.populate) {
      queryBuilder.populate([{ path: "productId", select: "name slug" }]);
    }

    return await queryBuilder.execute();
  }
  async startSession(): Promise<ClientSession> {
    return await this.model.db.startSession();
  }
}
