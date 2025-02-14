import Image from "next/image";
// import CreateReview from "./createReview";
import StarRatings from "react-star-ratings";
import dynamic from "next/dynamic";
import { reviewsTranslate } from "@/public/locales/client/(public)/reviewsTranslate";
import { lang } from "@/app/lib/utilities/lang";
import { useState } from "react";
import api from "@/app/lib/utilities/api";
import CustomButton from "@/components/button/button";
import { UserAuthType } from "@/app/lib/types/users.types";
import { ReviewsType } from "@/app/lib/types/reviews.types";
const CreateReview = dynamic(() => import("./createReview"));

type ReviewSectionProps = {
  reviews: {
    data: ReviewsType[];
    hasNextPage: boolean;
  };
  productId: string;
  user: UserAuthType | null;
};
const ReviewSection = ({ reviews, productId, user }: ReviewSectionProps) => {
  const [loading, setLoading] = useState(false);
  const [moreResults, setMoreResults] = useState(reviews.data || []);
  const [page, setPage] = useState(1);
  const [showMore, setShowMore] = useState(reviews.hasNextPage);

  const getMoreResults = async () => {
    try {
      setLoading(true);
      const newPage = page + 1;
      setPage((prevPage) => prevPage++);
      const { data } = await api.get(
        `/customer/reviews/${productId}/?page=${newPage}`
      );
      setMoreResults([...moreResults, ...data.data]);
      setPage(newPage);
      setShowMore(data.hasNextPage);
    } catch (error) {
      return null;
    } finally {
      setLoading(false);
    }
  };
  return (
    <div
    // className="review-section /bg-blue-100 /p-4 /bg-white rounded-md shadow-md"
    >
      <h2 className="text-2xl font-bold mb-4">
        {reviewsTranslate[lang].ReviewSection.title}
      </h2>
      {moreResults.length === 0 ? (
        <p className="text-gray-500">
          {reviewsTranslate[lang].ReviewSection.content.noReviews}
        </p>
      ) : (
        <div className="grid gap-4">
          {moreResults.map((review) => (
            <div
              key={review._id}
              // className="bg-gray-100 p-4 rounded-md shadow-md"
              className="card border p-4 hover:shadow-lg transition-shadow  /w-fit shadow-lg rounded bg-gray-200/70 /border-red-500"
            >
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {" "}
                  <Image
                    src={"/users/cat.png"}
                    width={50}
                    height={50}
                    alt={review.user.name ?? ""}
                    className="rounded-full"
                    priority
                  />
                  <p className="text-lg font-semibold">{review.user.name}</p>
                </div>{" "}
                <p className="text-gray-600">
                  <StarRatings
                    starRatedColor="#ffb829"
                    numberOfStars={5}
                    starDimension="20px"
                    starSpacing="2px"
                    name="rating"
                    rating={review.rating}
                  />
                </p>
              </div>
              <p className="text-gray-700 mt-2">{review.reviewText}</p>
              <p className="text-gray-500 mt-2">
                {reviewsTranslate[lang].ReviewSection.content.date}:{" "}
                {new Date(review.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
      <CustomButton
        showMore={showMore}
        getMoreResults={getMoreResults}
        loading={loading}
      />
      {user?.email && (
        <div>
          <CreateReview
            productId={productId}
            reviewsLength={moreResults.length}
          />
        </div>
      )}
    </div>
  );
};

export default ReviewSection;
