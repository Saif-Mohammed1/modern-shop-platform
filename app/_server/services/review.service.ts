import AppError from "@/app/lib/utilities/appError";
import { createReviewDto, updateReviewDto } from "../dtos/reviews.dto";
import ReviewModel from "../models/Review.model";
import { ReviewRepository } from "../repositories/review.repository";
import { QueryOptionConfig } from "@/app/lib/types/queryBuilder.types";
import { OrderRepository } from "../repositories/order.repository";
import OrderModel from "../models/Order.model ";
import { reviewControllerTranslate } from "@/public/locales/server/reviewControllerTranslate";
import { lang } from "@/app/lib/utilities/lang";
import { OrderStatus } from "@/app/lib/types/orders.types";

export class ReviewService {
  private reviewRepository = new ReviewRepository(ReviewModel);
  private orderRepository = new OrderRepository(OrderModel);
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
  }
  async createReview(dto: createReviewDto) {
    await this.checkIfUserHasOrderedProduct(
      dto.userId.toString(),
      dto.productId.toString()
    );
    const existingReview = await this.reviewRepository.findByProductAndUser(
      dto.productId,
      dto.userId
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
    return this.reviewRepository.create(dto);
  }

  async updateReview(reviewId: string, dto: updateReviewDto) {
    const review = await this.reviewRepository.findById(reviewId);
    if (!review) throw new AppError("Review not found", 404);
    if (review.userId.toString() !== dto.userId.toString()) {
      throw new AppError("Unauthorized to update this review", 403);
    }

    return this.reviewRepository.update(reviewId, dto);
  }

  async deleteReview(reviewId: string, userId: string) {
    const review = await this.reviewRepository.findById(reviewId);
    if (!review) throw new AppError("Review not found", 404);
    if (review.userId.toString() !== userId.toString()) {
      throw new AppError("Unauthorized to delete this review", 403);
    }

    await this.reviewRepository.delete(reviewId);
  }

  async getProductReviews(productId: string, options: QueryOptionConfig) {
    return this.reviewRepository.findByProduct(productId, options);
  }
  async getRatingDistribution(): Promise<number[]> {
    return this.reviewRepository.getRatingDistribution();
  }
  async getRatingDistributionByProductId(id: string): Promise<{
    [key: string]: number;
  }> {
    return this.reviewRepository.getRatingDistributionByProductId(id);
  }
  async getMyReviews(userId: string, options: QueryOptionConfig) {
    return this.reviewRepository.getMyReviews(userId, options);
  }
}
