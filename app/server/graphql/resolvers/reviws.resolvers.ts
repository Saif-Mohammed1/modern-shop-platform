import { lang } from "@/app/lib/utilities/lang";
import { ReviewTranslate } from "@/public/locales/server/Review.Translate";

import { ReviewValidation, type createReviewDto } from "../../dtos/reviews.dto";
import { AuthMiddleware } from "../../middlewares/auth.middleware";
import { ReviewService } from "../../services/review.service";
import { GlobalFilterValidator } from "../../validators/global-filter.validator";
import type { Context } from "../apollo-server";
interface QueryInput {
  page: number;
  limit: number;
}
const reviewService = new ReviewService();
export const reviewsResolvers = {
  Query: {
    getProductReviews: async (
      _parent: unknown,
      { product_id, filter }: { product_id: string; filter?: QueryInput },
      _context: Context
    ) => {
      const query = new URLSearchParams();
      if (filter?.page) {
        query.append("page", filter.page.toString());
      }
      if (filter?.limit) {
        query.append("limit", filter.limit.toString());
      }
      const reviews = await reviewService.getProductReviews(product_id, {
        query,
        populate: true,
      });
      return reviews;
    },
    getRatingDistributionByProductId: async (
      _parent: unknown,
      { product_id }: { product_id: string },
      _context: Context
    ) => {
      const distribution =
        await reviewService.getRatingDistributionByProductId(product_id);
      return distribution;
    },
    getMyReviews: async (
      _parent: unknown,
      { filter }: { filter?: QueryInput },
      { req }: Context
    ) => {
      await AuthMiddleware.requireAuth([])(req);
      const user_id = String(req.user?._id);
      const query = new URLSearchParams();
      if (filter?.page) {
        query.append("page", filter.page.toString());
      }
      if (filter?.limit) {
        query.append("limit", filter.limit.toString());
      }
      const reviews = await reviewService.getMyReviews(user_id, {
        query,
        populate: true,
      });
      return reviews;
    },
    checkReview: async (
      _parent: unknown,
      { product_id }: { product_id: string },
      { req }: Context
    ) => {
      await AuthMiddleware.requireAuth([])(req);
      const user_id = String(req.user?._id);

      await reviewService.checkIfUserHasOrderedProduct(user_id, product_id);
      return { exists: false }; // User can leave a review
    },
  },
  Mutation: {
    createReview: async (
      _parent: unknown,
      { input }: { input: Omit<createReviewDto, "user_id"> },
      { req }: Context
    ) => {
      await AuthMiddleware.requireAuth([])(req);
      const user_id = String(req.user?._id);
      const dto = ReviewValidation.validateCreateReview({
        ...input,
        user_id,
      });
      const review = await reviewService.createReview(dto);
      return review;
    },
    updateReview: async (
      _parent: unknown,
      { id, input }: { id: string; input: Partial<createReviewDto> },
      { req }: Context
    ) => {
      await AuthMiddleware.requireAuth([])(req);

      // Validate ID format
      const validatedId = GlobalFilterValidator.validateId(id);

      const user_id = String(req.user?._id);
      const dto = ReviewValidation.validateUpdateReview({
        ...input,
        user_id,
      });
      const review = await reviewService.updateReview(validatedId, dto);
      return review;
    },
    deleteReview: async (
      _parent: unknown,
      { id }: { id: string },
      { req }: Context
    ) => {
      await AuthMiddleware.requireAuth([])(req);

      // Validate ID format
      const validatedId = GlobalFilterValidator.validateId(id);

      const user_id = String(req.user?._id);
      await reviewService.deleteReview(validatedId, user_id);
      return {
        message: ReviewTranslate[lang].controllers.deleteReview.success,
      };
    },
  },
};
