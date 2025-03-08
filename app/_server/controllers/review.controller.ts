import { ReviewService } from "../services/review.service";
import { IUser } from "../models/User.model";
import { NextRequest, NextResponse } from "next/server";
import { ReviewValidation } from "../dtos/reviews.dto";
import AppError from "@/app/lib/utilities/appError";
import { ReviewTranslate } from "@/public/locales/server/Review.Translate";
import { lang } from "@/app/lib/utilities/lang";

class ReviewController {
  private reviewService = new ReviewService();

  async createReview(req: NextRequest) {
    const body = await req.json();
    const dto = ReviewValidation.validateCreateReview(body);
    const review = await this.reviewService.createReview(
      req.user as IUser,
      dto
    );
    return NextResponse.json(review, { status: 201 });
  }

  async updateReview(req: NextRequest) {
    if (!req.id)
      throw new AppError(ReviewTranslate[lang].errors.noDocumentsFound, 404);
    const body = await req.json();
    const dto = ReviewValidation.validateUpdateReview(body);
    const review = await this.reviewService.updateReview(
      req.id,
      (req.user as IUser)._id.toString(),
      dto
    );
    return NextResponse.json(review, { status: 200 });
  }

  async deleteReview(req: NextRequest) {
    if (!req.id)
      throw new AppError(ReviewTranslate[lang].errors.noDocumentsFound, 404);
    await this.reviewService.deleteReview(
      req?.id,
      (req.user as IUser)._id.toString()
    );
    return NextResponse.json(
      { message: ReviewTranslate[lang].controllers.deleteReview.success },
      { status: 200 }
    );
  }

  async getProductReviews(req: NextRequest) {
    if (!req.id)
      throw new AppError(ReviewTranslate[lang].errors.noDocumentsFound, 404);
    const reviews = await this.reviewService.getProductReviews(req?.id, {
      query: req.nextUrl.searchParams,
      populate: true,
    });
    return NextResponse.json(reviews, { status: 200 });
  }

  async getRatingDistribution() {
    const distribution = await this.reviewService.getRatingDistribution();
    return NextResponse.json(distribution, { status: 200 });
  }

  async getRatingDistributionByProductId(
    req: NextRequest
  ): Promise<NextResponse> {
    const distribution =
      await this.reviewService.getRatingDistributionByProductId(
        req.id as string
      );
    return NextResponse.json(distribution, { status: 200 });
  }

  async getMyReviews(req: NextRequest) {
    const reviews = await this.reviewService.getMyReviews(
      (req.user as IUser)._id.toString(),
      {
        query: req.nextUrl.searchParams,
        populate: true,
      }
    );
    return NextResponse.json(reviews, { status: 200 });
  }
}
export default new ReviewController();
