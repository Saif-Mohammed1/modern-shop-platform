"use client";

import Link from "next/link";
import { useState } from "react";

import type { ReviewsType } from "@/app/lib/types/reviews.types";
import { lang } from "@/app/lib/utilities/lang";
import { accountReviewsTranslate } from "@/public/locales/client/(auth)/account/reviewsTranslate";

import api from "../../app/lib/utilities/api";
import CustomButton from "../button/button";

const ReviewHistory = ({
  reviewsList,
  hasNextPage,
}: {
  hasNextPage: boolean;
  reviewsList: ReviewsType[];
}) => {
  const [loading, setLoading] = useState(false);
  const [moreResults, setMoreResults] = useState(reviewsList || []);
  const [page, setPage] = useState(1);
  const [showMore, setShowMore] = useState(hasNextPage);

  const getMoreResults = async () => {
    try {
      setLoading(true);
      const newPage = page + 1;
      const {
        data,
      }: {
        data: {
          docs: ReviewsType[];
          meta: {
            hasNext: boolean;
          };
        };
      } = await api.get(`/customers/reviews?page=${newPage}`);
      setMoreResults([...moreResults, ...data.docs]);
      setPage(newPage);
      setShowMore(data.meta.hasNext);
    } catch (_error) {
      return null;
    } finally {
      setLoading(false);
    }
    return null;
  };
  // const [error, setError] = useState(null);

  //   useEffect(() => {
  //     // Fetch reviews for the user
  //     const fetchReviews = async () => {
  //       try {
  //         const response = await axios.get(`/api/reviews/${userId}`);
  //         setReviews(response.data.data);
  //         setLoading(false);
  //       } catch (err) {
  //         setError(err.message);
  //         setLoading(false);
  //       }
  //     };

  //     fetchReviews();
  //   }, [userId]);

  //   if (loading) return <div>Loading...</div>;
  //   if (error) return <div>Error: {error}</div>;

  // useEffect(() => {
  //   setReviews(reviewsList);
  // }, [reviewsList]);
  return (
    <div className="container mx-auto mt-8 p-6 bg-gray-100 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6">
        {accountReviewsTranslate[lang].title}
      </h1>
      <div
        className="mx-auto p-6 bg-gray-100 rounded-lg shadow-lg
"
      >
        {moreResults.length > 0 ? (
          <>
            <div className="max-h-[80vh] overflow-y-scroll ">
              {moreResults.map((review) => (
                <div
                  key={review._id}
                  className="p-4 mb-4 bg-white rounded shadow-lg border border-gray-200"
                >
                  <Link
                    className="text-blue-500"
                    href={`/shop/${review.productId.slug}`}
                    target="_blank"
                  >
                    <h2 className="text-xl font-semibold mb-2">
                      {accountReviewsTranslate[lang].review.product}:{" "}
                      {review.productId.name}
                    </h2>
                  </Link>
                  <p className="mb-2">
                    <strong>
                      {accountReviewsTranslate[lang].review.rating}:
                    </strong>{" "}
                    <span className="text-yellow-500">
                      {"★".repeat(review.rating)}{" "}
                      {"☆".repeat(5 - review.rating)}
                    </span>
                  </p>
                  <p className="mb-2">
                    <strong>
                      {accountReviewsTranslate[lang].review.review}:
                    </strong>{" "}
                    {review.comment}
                  </p>
                  <p className="text-gray-500 text-sm">
                    {accountReviewsTranslate[lang].review.reviewedOn}:{" "}
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>{" "}
            <CustomButton
              showMore={showMore}
              getMoreResults={() => void getMoreResults()}
              loading={loading}
            />
          </>
        ) : (
          <p className="empty">{accountReviewsTranslate[lang].noReviewFound}</p>
        )}
      </div>
    </div>
  );
};

export default ReviewHistory;
