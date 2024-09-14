import Link from "next/link";

const OrderHistory = ({ ordersList }) => {
  return (
    <div className="container mx-auto mt-1 p-4 bg-gray-100 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6">My Order History</h1>
      <div className="max-h-[80vh] overflow-y-auto">
        {ordersList.length > 0 ? (
          ordersList.map((order) => (
            <div
              key={order._id}
              className="p-4 mb-4 bg-white rounded shadow-lg border border-gray-200"
            >
              <h2 className="text-xl font-semibold mb-2">
                Order #{order.invoiceId}
              </h2>
              <p className="mb-2">
                <strong>Status:</strong> {order.status}
              </p>
              <p className="mb-2">
                <strong>Products:</strong>
                <ul className="list-disc list-inside">
                  {order.items.map((item) => (
                    <li key={item._id}>
                      <Link
                        href={`/shop/${item._id}`}
                        target="_blank"
                        className="text-blue-500 hover:underline"
                      >
                        {" "}
                        {item.name}{" "}
                      </Link>
                      - Quantity: {item.quantity}
                    </li>
                  ))}
                </ul>
              </p>
              <p className="mb-2">
                <strong>Shipping Info:</strong> {order.shippingInfo.street},{" "}
                {order.shippingInfo.city}, {order.shippingInfo.state},{" "}
                {order.shippingInfo.postalCode}
              </p>
              <p className="mb-2">
                <strong>Phone:</strong> {order.shippingInfo.phone}
              </p>
              <p className="mb-2">
                <strong>Amount:</strong> ${order.totalPrice.toFixed(2)}
              </p>
              <Link
                href={order.invoiceLink}
                className="text-blue-500 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                View Invoice
              </Link>
              <p className="text-gray-500 text-sm">
                Ordered on: {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))
        ) : (
          <p className="empty">No orders found.</p>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
