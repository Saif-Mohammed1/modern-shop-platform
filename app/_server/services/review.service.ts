import AppError from "@/app/lib/utilities/appError";
import { createReviewDto, updateReviewDto } from "../dtos/reviews.dto";
import ReviewModel, { IReview } from "../models/Review.model";
import { IUser } from "../models/User.model";
import { ReviewRepository } from "../repositories/review.repository";
import { QueryOptionConfig } from "@/app/lib/types/queryBuilder.types";

export class ReviewService {
  private reviewRepository = new ReviewRepository(ReviewModel);

  async createReview(user: IUser, dto: createReviewDto) {
    const reviewData = {
      userId: user._id,
      productId: dto.productId,
      rating: dto.rating,
      comment: dto.comment,
    };

    return this.reviewRepository.create(reviewData);
  }

  async updateReview(reviewId: string, userId: string, dto: updateReviewDto) {
    const review = await this.reviewRepository.findById(reviewId);
    if (!review) throw new AppError("Review not found", 404);
    if (review.userId.toString() !== userId.toString()) {
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
