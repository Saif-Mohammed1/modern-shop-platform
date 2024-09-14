"use client";
// import api from "@/components/util/axios.api";
// import  { useState } from "react";
// import toast from "react-hot-toast";

//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//           <div className="bg-white p-6 rounded-lg shadow-lg max-w-md text-center">
//             <h2 className="text-xl font-bold text-red-600 mb-4">
//               Are you sure you want to cancel your order?
//             </h2>
//             <p className="text-gray-700 mb-4">
//               We're sorry to hear that you'd like to cancel your order. Could you please let us know why?
//             </p>
//             <textarea
//               value={cancellationReason}
//               onChange={(e) => setCancellationReason(e.target.value)}
//               placeholder="Reason for cancellation"
//               className="border rounded w-full px-3 py-2 mb-4"
//               rows="3"
//             />

//             <p className="text-gray-600 mb-6">
//               Cancelling this order may affect your refund eligibility. Please contact support if you have any questions.
//             </p>

//             <div className="flex justify-center space-x-4">
//               <button
//                 onClick={() => setShowCancelModal(false)}
//                 className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
//               >
//                 Nevermind
//               </button>
//               <button
//                 onClick={handleCancelOrder}
//                 className={`bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 ${isSubmitting ? "opacity-50" : ""}`}
//                 disabled={isSubmitting}
//               >
//                 {isSubmitting ? "Cancelling..." : "Yes, Cancel Order"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default CancelOrder;
import { useState } from "react";

const OrderCancellation = () => {
  const [reason, setReason] = useState("");
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleReasonChange = (e) => setReason(e.target.value);
  const handleFeedbackChange = (e) => setFeedback(e.target.value);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    // Here you can add the logic for submitting the cancellation request to the server
  };

  if (submitted) {
    return (
      <div className="flex w-full mx-auto flex-col items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-green-500">
            Order Canceled Successfully
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            Thank you for your feedback!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-lg">
        <h1 className="text-2xl font-semibold text-gray-700 text-center mb-6">
          Cancel Your Order
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-600 mb-2" htmlFor="reason">
              Why are you cancelling your order?{" "}
              <span className="text-red-500">*</span>
            </label>
            <select
              id="reason"
              value={reason}
              onChange={handleReasonChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="" disabled>
                Select a reason
              </option>
              <option value="found_cheaper">Found a cheaper alternative</option>
              <option value="changed_mind">Changed my mind</option>
              <option value="late_delivery">Delivery is taking too long</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-gray-600 mb-2" htmlFor="feedback">
              Please provide additional feedback (optional):
            </label>
            <textarea
              id="feedback"
              value={feedback}
              onChange={handleFeedbackChange}
              placeholder="Your feedback here..."
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full py-3 text-white bg-red-500 rounded-md hover:bg-red-600 transition duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-red-300"
          >
            Confirm Cancellation
          </button>
        </form>
      </div>
    </div>
  );
};

export default OrderCancellation;
