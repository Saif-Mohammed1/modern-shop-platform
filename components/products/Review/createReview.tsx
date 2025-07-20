"use client";

import { useLazyQuery, useMutation } from "@apollo/client";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { FiEdit3, FiX } from "react-icons/fi";
import StarRatings from "react-star-ratings";

import {
  CHECK_REVIEW_QUERY,
  CREATE_REVIEW_MUTATION,
} from "@/app/lib/graphql/mutations/reviews";
import { lang } from "@/app/lib/utilities/lang";
import { reviewsTranslate } from "@/public/locales/client/(public)/reviewsTranslate";

type CreateReviewProps = {
  reviewsLength: number;
  product_id: string;
};

const MAX_COMMENT_LENGTH = 500;

const CreateReview = ({ reviewsLength, product_id }: CreateReviewProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const router = useRouter();

  const [checkReviewQuery, { loading: checkReviewLoading }] =
    useLazyQuery(CHECK_REVIEW_QUERY);
  const [createReviewMutation, { loading: createReviewLoading }] = useMutation(
    CREATE_REVIEW_MUTATION
  );

  const isLoading = checkReviewLoading || createReviewLoading;

  const checkOrder = async () => {
    try {
      await checkReviewQuery({
        variables: { product_id },
      });
      toast.success(
        reviewsTranslate[lang].createReviewsSection.functions.checkOrder.success
      );
      setIsOpen(true);
    } catch (error) {
      toast.error(
        (error as Error).message || reviewsTranslate[lang].errors.global
      );
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error(
        reviewsTranslate[lang].createReviewsSection.functions.handleSubmit
          .ratingError
      );
      return;
    }

    if (comment.trim().length === 0) {
      toast.error(
        reviewsTranslate[lang].createReviewsSection.functions.handleSubmit
          .reviewError
      );
      return;
    }

    try {
      await createReviewMutation({
        variables: {
          input: {
            product_id,
            rating,
            comment,
          },
        },
      });
      toast.success(
        reviewsTranslate[lang].createReviewsSection.functions.handleSubmit
          .success
      );
      router.refresh();
      setRating(0);
      setComment("");
      setIsOpen(false);
    } catch (error) {
      toast.error(
        (error as Error).message || reviewsTranslate[lang].errors.global
      );
    }
  };

  const remainingCharacters = MAX_COMMENT_LENGTH - comment.length;

  return (
    <div className="w-full">
      <button
        onClick={checkOrder}
        disabled={isLoading || isOpen}
        className={`w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg
          shadow-lg hover:shadow-xl transition-all duration-300 font-medium flex items-center justify-center
          gap-2 ${isLoading ? "opacity-75 cursor-not-allowed" : ""}`}
      >
        <FiEdit3 className="w-5 h-5" />
        {reviewsLength > 0
          ? reviewsTranslate[lang].createReviewsSection.content.button
              .checkButton.writeReview
          : reviewsTranslate[lang].createReviewsSection.content.button
              .checkButton.firstReview}
      </button>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative"
            >
              <button
                onClick={() => {
                  setIsOpen(false);
                }}
                className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full"
                aria-label={
                  reviewsTranslate[lang].createReviewsSection.content.close
                }
              >
                <FiX className="w-6 h-6 text-gray-600" />
              </button>

              <h3 className="text-2xl font-bold mb-6">
                {reviewsTranslate[lang].createReviewsSection.content.title}
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {
                      reviewsTranslate[lang].createReviewsSection.content
                        .ratingLabel
                    }
                  </label>
                  <StarRatings
                    rating={rating}
                    changeRating={setRating}
                    numberOfStars={5}
                    starRatedColor="#f59e0b"
                    starHoverColor="#fbbf24"
                    starDimension="32px"
                    starSpacing="4px"
                    name="rating"
                  />
                  {rating === 0 && (
                    <p className="text-red-500 text-sm mt-1">
                      {
                        reviewsTranslate[lang].createReviewsSection.content
                          .ratingError
                      }
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {
                      reviewsTranslate[lang].createReviewsSection.content
                        .reviewLabel
                    }
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => {
                      setComment(e.target.value.slice(0, MAX_COMMENT_LENGTH));
                    }}
                    placeholder={
                      reviewsTranslate[lang].createReviewsSection.content
                        .textArea.placeholder
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500
                      focus:border-transparent transition-all resize-none"
                    rows={5}
                    aria-invalid={comment.trim().length === 0}
                  />
                  <div className="flex justify-between mt-2">
                    <span className="text-sm text-gray-500">
                      {remainingCharacters}{" "}
                      {
                        reviewsTranslate[lang].createReviewsSection.content
                          .charactersRemaining
                      }
                    </span>
                    {comment.trim().length === 0 && (
                      <span className="text-red-500 text-sm">
                        {
                          reviewsTranslate[lang].createReviewsSection.content
                            .reviewError
                        }
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={
                    isLoading || rating === 0 || comment.trim().length === 0
                  }
                  className="w-full py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors
                    disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    reviewsTranslate[lang].createReviewsSection.content.button
                      .submitButton.submit
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default CreateReview;
