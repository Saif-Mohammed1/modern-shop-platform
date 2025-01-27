import Image from "next/image";
// import CreateReview from "./createReview";
import StarRatings from "react-star-ratings";
import dynamic from "next/dynamic";
import { UserType } from "@/components/context/user.context";
import { reviewsTranslate } from "@/app/_translate/reviewsTranslate";
import { lang } from "@/components/util/lang";
import { useState } from "react";
const CreateReview = dynamic(() => import("./createReview"));
type Review = {
  _id: string;
  user: Partial<UserType>;
  rating: number;
  reviewText: string;
  createdAt: string;
};
type ReviewSectionProps = {
  reviews: Review[];
  productId: string;
  user: UserType | null;
};
const ReviewSection = ({ reviews, productId, user }: ReviewSectionProps) => {
  const [loading, setLoading] = useState(false);
  const [moreReviews, setMoreReviews] = useState(reviews);
  return (
    <div
    // className="review-section /bg-blue-100 /p-4 /bg-white rounded-md shadow-md"
    >
      <h2 className="text-2xl font-bold mb-4">
        {reviewsTranslate[lang].ReviewSection.title}
      </h2>
      {moreReviews.length === 0 ? (
        <p className="text-gray-500">
          {reviewsTranslate[lang].ReviewSection.content.noReviews}
        </p>
      ) : (
        <div className="grid gap-4">
          {moreReviews.map((review) => (
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
      <div className={user?.email ? "" : "hidden"}>
        <CreateReview
          productId={productId}
          reviewsLength={moreReviews.length}
        />{" "}
      </div>
    </div>
  );
};

export default ReviewSection;
