import Image from "next/image";
// import CreateReview from "./createReview";
import StarRatings from "react-star-ratings";
import dynamic from "next/dynamic";
const CreateReview = dynamic(() => import("./createReview"));
const ReviewSection = ({ reviews, productId, user }) => {
  return (
    <div
    // className="review-section /bg-blue-100 /p-4 /bg-white rounded-md shadow-md"
    >
      <h2 className="text-2xl font-bold mb-4">Reviews</h2>
      {reviews.length === 0 ? (
        <p className="text-gray-500">No reviews yet</p>
      ) : (
        <div className="grid gap-4">
          {reviews.map((review) => (
            <div
              key={review._id}
              // className="bg-gray-100 p-4 rounded-md shadow-md"
              className="card border p-4 hover:shadow-lg transition-shadow  /w-fit shadow-lg rounded bg-gray-200/70 /border-red-500"
            >
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {" "}
                  <Image
                    src={"/users/user.jpg"}
                    width={50}
                    height={50}
                    alt={review.user.name}
                    className="rounded-full"
                    priority
                  />
                  <p className="text-lg font-semibold">{review.user.name}</p>
                </div>{" "}
                <p className="text-gray-600">
                  <StarRatings
                    name="read-only"
                    value={review.rating}
                    // precision={0.2}
                    readOnly
                    size="15"
                  />
                </p>
              </div>
              <p className="text-gray-700 mt-2">{review.reviewText}</p>
              <p className="text-gray-500 mt-2">
                Date: {new Date(review.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
      <div className={user?.email ? "" : "hidden"}>
        <CreateReview productId={productId} reviewsLength={reviews.length} />{" "}
      </div>
    </div>
  );
};

export default ReviewSection;
