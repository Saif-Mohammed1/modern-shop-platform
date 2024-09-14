// components/OrderStatus.js
import Link from "next/link";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const OrderStatus = ({ isSuccess }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-6 py-8">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md text-center">
        {isSuccess ? (
          <div className="text-green-500">
            <FaCheckCircle className="text-6xl mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Order Successful!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for your purchase. Your order has been successfully
              placed.
            </p>
          </div>
        ) : (
          <div className="text-red-500">
            <FaTimesCircle className="text-6xl mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Order Failed</h2>
            <p className="text-gray-600 mb-6">
              Unfortunately, your order could not be processed. Please try again
              or contact support.
            </p>
          </div>
        )}

        <Link
          href="/shop"
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2
          px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-400
          focus:ring-opacity-75 transition duration-150 ease-in-out"
        >
          {" "}
          Go Back to Shop
        </Link>
      </div>
    </div>
  );
};

export default OrderStatus;
