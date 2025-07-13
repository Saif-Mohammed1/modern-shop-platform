import { OrderStatus } from "@/app/lib/types/orders.db.types";
import type { QueryOptionConfig } from "@/app/lib/types/queryBuilder.types";
import AppError from "@/app/lib/utilities/appError";
import { generateUUID } from "@/app/lib/utilities/id";
import { lang } from "@/app/lib/utilities/lang";
import { reviewControllerTranslate } from "@/public/locales/server/reviewControllerTranslate";

import { connectDB } from "../db/db";
import type { createReviewDto, updateReviewDto } from "../dtos/reviews.dto";
import { OrderRepository } from "../repositories/order.repository";
import { ReviewRepository } from "../repositories/review.repository";

export class ReviewService {
  constructor(
    private readonly reviewRepository: ReviewRepository = new ReviewRepository(
      connectDB()
    ),
    private readonly orderRepository: OrderRepository = new OrderRepository(
      connectDB()
    )
  ) {}
  async checkIfUserHasOrderedProduct(user_id: string, product_id: string) {
    const order = await this.orderRepository.findByUserAndProduct(
      user_id,
      product_id
    );
    // if (!order) {
    //   throw new AppError(
    //     "You must have ordered this product to review it",
    //     403
    //   );
    // }
    if (!order) {
      throw new AppError(
        reviewControllerTranslate[
          lang
        ].controllers.checkReview.needToBuyProductFirst,
        404
      );
    }

    if (order.status !== OrderStatus.Completed) {
      throw new AppError(
        reviewControllerTranslate[
          lang
        ].controllers.checkReview.needToWaitForOrderCompletion,
        404
      );
    }
    const existingReview = await this.reviewRepository.findByProductAndUser(
      product_id,
      user_id
    );
    if (existingReview) {
      // throw new AppError("You have already reviewed this product", 403);
      throw new AppError(
        reviewControllerTranslate[
          lang
        ].controllers.checkReview.oneReviewPerProduct,
        400
      );
    }
  }
  async createReview(dto: createReviewDto) {
    await this.checkIfUserHasOrderedProduct(
      dto.user_id.toString(),
      dto.product_id.toString()
    );
    // const existingReview = await this.reviewRepository.findByProductAndUser(
    //   dto.product_id,
    //   dto.user_id
    // );
    // if (existingReview) {
    //   // throw new AppError("You have already reviewed this product", 403);
    //   throw new AppError(
    //     reviewControllerTranslate[
    //       lang
    //     ].controllers.checkReview.oneReviewPerProduct,
    //     400
    //   );
    // }
    return await this.reviewRepository.create({
      ...dto,
      _id: generateUUID(),

      user_id: dto.user_id,
      product_id: dto.product_id,
    });
  }

  async updateReview(reviewId: string, dto: updateReviewDto) {
    const review = await this.reviewRepository.findById(reviewId);
    if (!review) {
      throw new AppError(
        reviewControllerTranslate[lang].errors.noDocumentsFound,
        404
      );
    }
    if (review.user_id.toString() !== dto.user_id.toString()) {
      throw new AppError(
        reviewControllerTranslate[lang].errors.unauthorized.update,
        403
      );
    }

    return await this.reviewRepository.update(reviewId, dto);
  }

  async deleteReview(reviewId: string, user_id: string) {
    const review = await this.reviewRepository.findById(reviewId);
    if (!review) {
      throw new AppError(
        reviewControllerTranslate[lang].errors.noDocumentsFound,
        404
      );
    }
    if (review.user_id.toString() !== user_id.toString()) {
      throw new AppError(
        reviewControllerTranslate[lang].errors.unauthorized.delete,
        403
      );
    }

    await this.reviewRepository.delete(reviewId);
  }

  async getProductReviews(product_id: string, options: QueryOptionConfig) {
    return await this.reviewRepository.findByProduct(product_id, options);
  }
  async getRatingDistribution(): Promise<number[]> {
    return await this.reviewRepository.getRatingDistribution();
  }
  async getRatingDistributionByProductId(id: string) {
    return await this.reviewRepository.getRatingDistributionByProductId(id);
  }
  async getMyReviews(user_id: string, options: QueryOptionConfig) {
    return await this.reviewRepository.getMyReviews(user_id, options);
  }
}
