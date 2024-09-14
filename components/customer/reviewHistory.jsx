"use client";
import { useState } from "react";

const ReviewHistory = ({ reviewsList }) => {
  const [reviews, setReviews] = useState(reviewsList || []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return (
    <div className="container mx-auto mt-8 p-6 bg-gray-100 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6">My Review History</h1>
      <div
        className="max-h-[80vh] overscroll-y-auto mx-auto p-6 bg-gray-100 rounded-lg shadow-lg
"
      >
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div
              key={review._id}
              className="p-4 mb-4 bg-white rounded shadow-lg border border-gray-200"
            >
              <h2 className="text-xl font-semibold mb-2">
                Product: {review.product.name}
              </h2>
              <p className="mb-2">
                <strong>Rating:</strong>{" "}
                <span className="text-yellow-500">
                  {"★".repeat(review.rating)} {"☆".repeat(5 - review.rating)}
                </span>
              </p>
              <p className="mb-2">
                <strong>Review:</strong> {review.reviewText}
              </p>
              <p className="text-gray-500 text-sm">
                Reviewed on: {new Date(review.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))
        ) : (
          <p className="empty">No reviews found.</p>
        )}
      </div>
    </div>
  );
};

export default ReviewHistory;
