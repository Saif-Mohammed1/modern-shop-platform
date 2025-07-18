"use client";

import { gql, useLazyQuery } from "@apollo/client";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";

import type { ReviewsType } from "@/app/lib/types/reviews.db.types";
import { lang } from "@/app/lib/utilities/lang";
import { accountReviewsTranslate } from "@/public/locales/client/(auth)/account/reviewsTranslate";

import CustomButton from "../button/button";
import LoadingSpinner from "../spinner/LoadingSpinner";

const GET_REVIEWS = gql`
  query ($request: Filter) {
    getMyReviews(filter: $request) {
      docs {
        _id
        user_id
        product_id {
          name
          slug
        }
        rating
        comment
        created_at
      }
      meta {
        hasNext
      }
    }
  }
`;

const ReviewHistory = ({
  reviewsList,
  hasNextPage,
}: {
  hasNextPage: boolean;
  reviewsList: ReviewsType[];
}) => {
  const [reviews, setReviews] = useState<ReviewsType[]>(reviewsList || []);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState<boolean>(hasNextPage || false);

  const [getMoreReviews, { loading }] = useLazyQuery<{
    getMyReviews: {
      docs: ReviewsType[];
      meta: {
        hasNext: boolean;
      };
    };
  }>(GET_REVIEWS, {
    fetchPolicy: "cache-and-network",
    onCompleted: (data) => {
      if (data?.getMyReviews) {
        setReviews((prevReviews) => [
          ...prevReviews,
          ...data.getMyReviews.docs,
        ]);
        setHasMore(data.getMyReviews.meta.hasNext);
      }
    },
    onError: (error) => {
      toast.error(error.message || accountReviewsTranslate[lang].noReviewFound);
    },
  });

  const loadMoreReviews = async () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);

    await getMoreReviews({
      variables: {
        request: {
          page: nextPage,
          limit: 10,
        },
      },
    });
  };

  return (
    <div className="container mx-auto mt-8 p-6 bg-gray-100 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6">
        {accountReviewsTranslate[lang].title}
      </h1>
      <div
        className="mx-auto p-6 bg-gray-100 rounded-lg shadow-lg
"
      >
        {loading && reviews.length === 0 ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <LoadingSpinner
              size="lg"
              variant="dots"
              text="Loading reviews..."
            />
          </div>
        ) : reviews.length > 0 ? (
          <>
            <div className="max-h-[80vh] overflow-y-scroll ">
              {reviews.map((review) => (
                <div
                  key={review._id}
                  className="p-4 mb-4 bg-white rounded shadow-lg border border-gray-200"
                >
                  <Link
                    className="text-blue-500"
                    href={`/shop/${review.product_id[0].slug}`}
                    target="_blank"
                  >
                    <h2 className="text-xl font-semibold mb-2">
                      {accountReviewsTranslate[lang].review.product}:{" "}
                      {review.product_id[0].name}
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
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>{" "}
            <CustomButton
              showMore={hasMore}
              getMoreResults={loadMoreReviews}
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
