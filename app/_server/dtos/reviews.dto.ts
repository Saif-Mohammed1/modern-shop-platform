import { z } from "zod";
import { reviewControllerTranslate } from "@/public/locales/server/reviewControllerTranslate";
import { lang } from "@/app/lib/utilities/lang";
import { zObjectId } from "@/app/lib/utilities/assignAsObjectId";
// Custom Zod type for MongoDB ObjectId validation

export class ReviewValidation {
  static createReviewSchema = z.object({
    productId: zObjectId,
    rating: z
      .number({
        required_error:
          reviewControllerTranslate[lang].controllers.createReviews
            .ratingRequired,
      })
      .int()
      .min(1, {
        message:
          reviewControllerTranslate[lang].controllers.createReviews
            .ratingLessThanOne,
      })
      .max(5, {
        message:
          reviewControllerTranslate[lang].controllers.createReviews.maxRating,
      }),
    comment: z
      .string({
        required_error:
          reviewControllerTranslate[lang].controllers.createReviews
            .reviewTextRequired,
      })
      .min(4, {
        message:
          reviewControllerTranslate[lang].controllers.createReviews
            .minReviewText,
      })
      .max(200, {
        message:
          reviewControllerTranslate[lang].controllers.createReviews
            .maxReviewText,
      }),
  });

  static validateCreateReview = (data: any) => {
    return this.createReviewSchema.parse(data);
  };

  static UpdateReviewDto = z.object({
    rating: z
      .number({
        required_error:
          reviewControllerTranslate[lang].controllers.createReviews
            .ratingRequired,
      })
      .int()
      .min(1, {
        message:
          reviewControllerTranslate[lang].controllers.createReviews
            .ratingLessThanOne,
      })
      .max(5, {
        message:
          reviewControllerTranslate[lang].controllers.createReviews.maxRating,
      })
      .optional(),
    comment: z
      .string({
        required_error:
          reviewControllerTranslate[lang].controllers.createReviews
            .reviewTextRequired,
      })
      .min(4, {
        message:
          reviewControllerTranslate[lang].controllers.createReviews
            .minReviewText,
      })
      .max(200, {
        message:
          reviewControllerTranslate[lang].controllers.createReviews
            .maxReviewText,
      })
      .optional(),
  });

  static validateUpdateReview = (data: any) => {
    return this.UpdateReviewDto.parse(data);
  };
}

export type createReviewDto = z.infer<
  typeof ReviewValidation.createReviewSchema
>;

export type updateReviewDto = z.infer<typeof ReviewValidation.UpdateReviewDto>;
