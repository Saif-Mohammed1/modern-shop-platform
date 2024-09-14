import Link from "next/link";
import { FaHome, FaTruck } from "react-icons/fa";

const OrderCompleted = ({ order }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      {/* Success Message */}
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-green-600 mb-4 text-center">
          🎉 Thank You! Your Order is Completed!
        </h1>

        {/* Order Summary */}
        <div className="border-t border-gray-200 pt-4">
          <p className="text-lg mb-2">
            Order ID: <span className="font-semibold">{order._id}</span>
          </p>
          <p className="text-lg mb-2">
            Order Date:{" "}
            <span className="font-semibold">
              {new Date(order.createdAt).toLocaleDateString()}
            </span>
          </p>
          <p className="text-lg mb-4">
            Total Amount:{" "}
            <span className="font-semibold">
              ${order.totalPrice.toFixed(2)}
            </span>
          </p>

          {/* Products */}
          <h2 className="text-xl font-bold mb-2">Order Items:</h2>
          <ul className="mb-4">
            {order.items.map((item, index) => (
              <li
                key={index}
                className="flex justify-between items-center mb-2"
              >
                <div>
                  <p className="text-lg">{item.name}</p>
                  <p className="text-sm text-gray-500">
                    Quantity: {item.quantity}
                  </p>
                  {item.discount > 0 && (
                    <p className="text-sm text-green-600">
                      Discount Applied: ${item.discount.toFixed(2)}
                    </p>
                  )}
                  {item.discountExpire && (
                    <p className="text-xs text-gray-500">
                      Discount Expires:{" "}
                      {new Date(item.discountExpire).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div>
                  {item.discount > 0 ? (
                    <>
                      <p className="line-through text-sm text-gray-500">
                        ${item.price.toFixed(2)}
                      </p>
                      <p className="font-semibold text-green-600">
                        ${item.finalPrice.toFixed(2)}
                      </p>
                    </>
                  ) : (
                    <p className="font-semibold">${item.price.toFixed(2)}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className="flex justify-between mt-8">
            <Link
              href="/account/orders"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-flex items-center"
            >
              <FaTruck className="mr-2" />
              Track Order
            </Link>
            <Link
              href="/"
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded inline-flex items-center"
            >
              <FaHome className="mr-2" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderCompleted;
