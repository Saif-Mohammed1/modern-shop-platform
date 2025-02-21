// "use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import StarRatings from "react-star-ratings";
import api from "@/app/lib/utilities/api";
import { reviewsTranslate } from "@/public/locales/client/(public)/reviewsTranslate";
import { lang } from "@/app/lib/utilities/lang";
type CreateReviewProps = {
  reviewsLength: number;
  productId: string;
};
const CreateReview = ({ reviewsLength, productId }: CreateReviewProps) => {
  const [openReviewer, setOpenReviewer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(0); // State for rating input
  const [comment, setComment] = useState(""); // State for review text input
  const router = useRouter();
  const checkOrder = async () => {
    setLoading(true);
    let toastLoading;
    try {
      toastLoading = toast.loading(
        reviewsTranslate[lang].createReviewsSection.functions.checkOrder.loading
      );
      // Example API call to check if user has ordered the product
      await api.patch(`/customer/reviews/${productId}`);
      toast.success(
        reviewsTranslate[lang].createReviewsSection.functions.checkOrder.success
      );
      setOpenReviewer(true);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || reviewsTranslate[lang].errors.global);
      } else {
        toast.error(reviewsTranslate[lang].errors.global);
      }
    } finally {
      toast.dismiss(toastLoading);
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    let toastLoading;
    try {
      // Validate rating and review text
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

      // Perform submission logic
      setLoading(true);
      toastLoading = toast.loading(
        reviewsTranslate[lang].createReviewsSection.functions.handleSubmit
          .loading
      );
      // Example API call to submit review
      await api.post(`/customer/reviews/${productId}`, {
        rating,
        comment,
      });

      toast.success(
        reviewsTranslate[lang].createReviewsSection.functions.handleSubmit
          .success
      );
      // Reset form state after successful submission
      router.refresh();
      setRating(0);
      setComment("");
      setOpenReviewer(false);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || reviewsTranslate[lang].errors.global);
      } else {
        toast.error(reviewsTranslate[lang].errors.global);
      }
    } finally {
      toast.dismiss(toastLoading);
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center flex-col space-y-4 mt-5">
      <button
        onClick={checkOrder}
        disabled={loading || openReviewer}
        className={`py-2 px-4 bg-blue-500 text-white rounded-md shadow-md transition duration-300 hover:bg-blue-600 focus:outline-none cursor-pointer ${
          openReviewer ? "hidden" : ""
        }`}
      >
        {loading
          ? reviewsTranslate[lang].createReviewsSection.content.button
              .checkButton.loading
          : reviewsLength > 0
            ? reviewsTranslate[lang].createReviewsSection.content.button
                .checkButton.writeReview
            : reviewsTranslate[lang].createReviewsSection.content.button
                .checkButton.firstReview}
      </button>
      {openReviewer && (
        <div className="flex flex-col items-start space-y-4  ">
          <StarRatings
            rating={rating}
            starRatedColor="#ffb829"
            changeRating={(newRating) => setRating(newRating)}
            numberOfStars={5}
            starDimension="30px"
            starSpacing="2px"
            name="rating"
            /**  rating={product.ratingsAverage}
                        starRatedColor="#ffb829"
                        numberOfStars={5}
                        starDimension="20px"
                        starSpacing="2px"
                        name="rating" */
          />
          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder={
              reviewsTranslate[lang].createReviewsSection.content.textArea
                .placeholder
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500
            bg-gray-200"
            rows={4}
          />
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="py-2 px-4 bg-blue-500 text-white rounded-md shadow-md transition duration-300 hover:bg-blue-600 focus:outline-none"
          >
            {loading
              ? reviewsTranslate[lang].createReviewsSection.content.button
                  .submitButton.loading
              : reviewsTranslate[lang].createReviewsSection.content.button
                  .submitButton.submit}
          </button>
        </div>
      )}
    </div>
  );
};

export default CreateReview;
