import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useState } from "react";
import StarRatings from "react-star-ratings";

// import Skeleton from "react-loading-skeleton";
// import "react-loading-skeleton/dist/skeleton.css";
import type { ReviewsType } from "@/app/lib/types/reviews.types";
import type { UserAuthType } from "@/app/lib/types/users.types";
import api from "@/app/lib/utilities/api";
// import CustomButton from "@/components/button/button";
import { lang } from "@/app/lib/utilities/lang";
import { reviewsTranslate } from "@/public/locales/client/(public)/reviewsTranslate";

const CreateReview = dynamic(
  () => import("./createReview")
  //  {
  //   loading: () => <Skeleton count={3} height={100} />,
  //   ssr: false
  // }
);

type ReviewSectionProps = {
  reviews: {
    data: ReviewsType[];
    hasNextPage: boolean;
    distribution: {
      [key: string]: number;
    };
  };
  averageRating: number;
  totalReviews: number;
  productId: string;
  user: UserAuthType | null;
};

const ReviewSection = ({
  reviews,
  productId,
  user,
  averageRating,
  totalReviews,
}: ReviewSectionProps) => {
  const [loading, setLoading] = useState(false);
  const [moreResults, setMoreResults] = useState(reviews.data || []);
  const [page, setPage] = useState(1);
  const [showMore, setShowMore] = useState(reviews.hasNextPage);

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
      } = await api.get(`/customers/reviews/${productId}/?page=${newPage}`);
      setMoreResults((prev) => [...prev, ...data.docs]);
      setPage(newPage);
      setShowMore(data.meta.hasNext);
    } finally {
      setLoading(false);
    }
  };

  // const ratingDistribution = () => {
  //   const distribution = [0, 0, 0, 0, 0];
  //   moreResults.forEach((review) => {
  //     distribution[Math.round(review.rating) - 1]++;
  //   });
  //   return distribution.map((count) => (count / moreResults.length) * 100);
  // };
  return (
    <section className="space-y-8">
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-3xl font-bold mb-6">
          {reviewsTranslate[lang].ReviewSection.title}
        </h2>

        {/* Rating Overview */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="text-center">
            <div className="text-5xl font-bold text-primary mb-2">
              {averageRating.toFixed(1)}
            </div>
            <StarRatings
              rating={averageRating}
              starRatedColor="#f59e0b"
              starDimension="28px"
              starSpacing="2px"
            />
            <p className="text-gray-600 mt-2">
              {totalReviews}{" "}
              {reviewsTranslate[lang].ReviewSection.content.reviews}
            </p>
          </div>

          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center gap-3">
                <span className="w-8 text-gray-600">
                  {star} {reviewsTranslate[lang].ReviewSection.content.star}
                </span>
                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[rgba(245,158,11,0.5)] transition-all duration-500"
                    style={{
                      width: `${((reviews.distribution[star] || 0) / totalReviews) * 100}%`,
                      // width: `${Math.min(100, ((reviews.distribution[star] || 0) / totalReviews) * 100)}%`,
                    }} // style={{ width: `${ratingDistribution()[4 - idx]}%` }}
                  />
                </div>
                <span className="w-12 text-gray-600 text-sm">
                  {Math.round(
                    ((reviews.distribution[star] || 0) / totalReviews) * 100
                  )}
                  % {/* {Math.round(ratingDistribution()[4 - idx])}% */}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews List */}
        {moreResults.length === 0 ? (
          <div className="text-center py-12">
            <Image
              src="/empty-reviews.jpg"
              width={300}
              height={200}
              alt={reviewsTranslate[lang].ReviewSection.content.noReviews}
              className="mx-auto"
            />
            <p className="text-gray-500 mt-4">
              {reviewsTranslate[lang].ReviewSection.content.noReviews}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {moreResults.map((review) => (
              // <div
              //   key={review._id}
              //   // initial={{ opacity: 0, y: 10 }}
              //   // animate={{ opacity: 1, y: 0 }}
              //   className="p-6 bg-gray-50 rounded-lg hover:bg-white transition-colors"
              // >
              <motion.div
                key={review._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-gray-50 rounded-lg hover:bg-white transition-colors"
              >
                <div className="flex gap-4 items-start">
                  <Image
                    src="/users/cat.png"
                    // src={review.userId?.avatar || "/users/default-avatar.svg"}
                    width={48}
                    height={48}
                    alt={review.userId?.name ?? "default-avatar"}
                    className="rounded-full flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <div>
                        <h3 className="font-semibold">{review.userId.name}</h3>
                        <p className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString(lang, {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <StarRatings
                        rating={review.rating}
                        starRatedColor="#f59e0b"
                        starDimension="20px"
                        starSpacing="2px"
                      />
                    </div>
                    <p className="mt-3 text-gray-700 leading-relaxed">
                      {review.comment}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {showMore ? (
          <div className="mt-8 flex justify-center">
            <button
              onClick={getMoreResults}
              disabled={loading}
              className="px-6 py-2 bg-white border border-gray-300 rounded-full hover:bg-gray-50 disabled:opacity-50 transition-all"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span>
                  {reviewsTranslate[lang].ReviewSection.content.loading}
                </span>
              ) : (
                reviewsTranslate[lang].ReviewSection.content.loadMore
              )}
            </button>
          </div>
        ) : null}
      </div>

      {/* Create Review */}
      {user?.email ? (
        <div className="sticky bottom-6 bg-white p-6 rounded-xl shadow-lg">
          <CreateReview
            productId={productId}
            reviewsLength={moreResults.length}
          />
        </div>
      ) : null}
    </section>
  );
};

export default ReviewSection;
