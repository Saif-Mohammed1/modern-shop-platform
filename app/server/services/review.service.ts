import AppError from "@/app/lib/utilities/appError";
import type { createReviewDto, updateReviewDto } from "../dtos/reviews.dto";
import ReviewModel from "../models/Review.model";
import { ReviewRepository } from "../repositories/review.repository";
import type { QueryOptionConfig } from "@/app/lib/types/queryBuilder.types";
import { OrderRepository } from "../repositories/order.repository";
import OrderModel from "../models/Order.model";
import { reviewControllerTranslate } from "@/public/locales/server/reviewControllerTranslate";
import { lang } from "@/app/lib/utilities/lang";
import { OrderStatus } from "@/app/lib/types/orders.types";
import { assignAsObjectId } from "@/app/lib/utilities/assignAsObjectId";

export class ReviewService {
  constructor(
    private readonly reviewRepository: ReviewRepository = new ReviewRepository(
      ReviewModel
    ),
    private readonly orderRepository: OrderRepository = new OrderRepository(
      OrderModel
    )
  ) {}
  async checkIfUserHasOrderedProduct(userId: string, productId: string) {
    const order = await this.orderRepository.findByUserAndProduct(
      userId,
      productId
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
      assignAsObjectId(productId),
      assignAsObjectId(userId)
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
      dto.userId.toString(),
      dto.productId.toString()
    );
    // const existingReview = await this.reviewRepository.findByProductAndUser(
    //   dto.productId,
    //   dto.userId
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
    return await this.reviewRepository.create(dto);
  }

  async updateReview(reviewId: string, dto: updateReviewDto) {
    const review = await this.reviewRepository.findById(reviewId);
    if (!review)
      throw new AppError(
        reviewControllerTranslate[lang].errors.noDocumentsFound,
        404
      );
    if (review.userId.toString() !== dto.userId.toString()) {
      throw new AppError(
        reviewControllerTranslate[lang].errors.unauthorized.update,
        403
      );
    }

    return await this.reviewRepository.update(reviewId, dto);
  }

  async deleteReview(reviewId: string, userId: string) {
    const review = await this.reviewRepository.findById(reviewId);
    if (!review)
      throw new AppError(
        reviewControllerTranslate[lang].errors.noDocumentsFound,
        404
      );
    if (review.userId.toString() !== userId.toString()) {
      throw new AppError(
        reviewControllerTranslate[lang].errors.unauthorized.delete,
        403
      );
    }

    await this.reviewRepository.delete(reviewId);
  }

  async getProductReviews(productId: string, options: QueryOptionConfig) {
    return await this.reviewRepository.findByProduct(productId, options);
  }
  async getRatingDistribution(): Promise<number[]> {
    return await this.reviewRepository.getRatingDistribution();
  }
  async getRatingDistributionByProductId(id: string): Promise<{
    [key: string]: number;
  }> {
    return await this.reviewRepository.getRatingDistributionByProductId(id);
  }
  async getMyReviews(userId: string, options: QueryOptionConfig) {
    return await this.reviewRepository.getMyReviews(userId, options);
  }
}
