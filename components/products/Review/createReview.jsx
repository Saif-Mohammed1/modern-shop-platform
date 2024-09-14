// "use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import StarRatings from "react-star-ratings";
import api from "@/components/util/axios.api";

const CreateReview = ({ reviewsLength, productId }) => {
  const [openReviewer, setOpenReviewer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(0); // State for rating input
  const [reviewText, setReviewText] = useState(""); // State for review text input
  const router = useRouter();
  const checkOrder = async () => {
    setLoading(true);
    let toastLoading;
    try {
      toastLoading = toast.loading("Checking order...");
      // Example API call to check if user has ordered the product
      await api.patch(`/customer/reviews/${productId}`);
      toast.success("You can now write a review.");
      setOpenReviewer(true);
    } catch (error) {
      toast.error(
        error?.message ||
          error ||
          "An unexpected error occurred. Please try again later."
      );
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
        toast.error("Please provide a rating.");
        return;
      }
      if (reviewText.trim().length === 0) {
        toast.error("Please provide a review.");
        return;
      }

      // Perform submission logic
      setLoading(true);
      toastLoading = toast.loading("Submitting review...");
      // Example API call to submit review
      await api.post(`/customer/reviews/${productId}`, {
        rating,
        reviewText,
      });

      toast.success("Review submitted successfully.");
      // Reset form state after successful submission
      router.refresh();
      setRating(0);
      setReviewText("");
      setOpenReviewer(false);
    } catch (error) {
      toast.error(
        error?.message ||
          error ||
          "An unexpected error occurred. Please try again later."
      );
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
          ? "Loading..."
          : reviewsLength > 0
          ? "Write a Review"
          : "Be the first to review"}
      </button>
      {openReviewer && (
        <div className="flex flex-col items-start space-y-4  ">
          <StarRatings
            value={rating}
            onChange={(event, newValue) => setRating(newValue)}
            precision={0.2}
            className="self-center"
          />
          <textarea
            value={reviewText}
            onChange={(event) => setReviewText(event.target.value)}
            placeholder="Write your review here..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500
            bg-gray-200"
            rows={4}
          />
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="py-2 px-4 bg-blue-500 text-white rounded-md shadow-md transition duration-300 hover:bg-blue-600 focus:outline-none"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      )}
    </div>
  );
};

export default CreateReview;
