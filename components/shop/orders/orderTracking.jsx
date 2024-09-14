import Link from "next/link";

const UserOrderTracking = ({ order }) => {
  if (!order) {
    return <p className="text-center mt-6">Order not found.</p>;
  }

  return (
    // <div className="container mx-auto px-4 py-6">
    //   <h1 className="text-3xl font-semibold mb-6 text-center">
    //     Track Your Order
    //   </h1>
    <div className="border p-6 rounded shadow-lg bg-white">
      <h2 className="text-2xl font-bold mb-4">Order #{order._id}</h2>

      {/* Shipping Info Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-xl font-semibold mb-2">Shipping Info</h3>
          <p>{order.shippingInfo.street}</p>
          <p>
            {order.shippingInfo.city}, {order.shippingInfo.state}
          </p>
          <p>{order.shippingInfo.postalCode}</p>
          <p>{order.shippingInfo.country}</p>
          <p>Phone: {order.shippingInfo.phone}</p>
        </div>

        {/* Items Section */}
        <div>
          <h3 className="text-xl font-semibold mb-2">Items Ordered</h3>
          <ul className="space-y-4">
            {order.items.map((item, index) => (
              <li
                key={item._id}
                className="border-b pb-4 mb-4 last:border-b-0 last:mb-0"
              >
                <p>
                  <span className="font-bold">Name:</span> {item.name}
                </p>
                <p>
                  <span className="font-bold">Quantity:</span> {item.quantity}
                </p>
                <p>
                  <span className="font-bold">Price:</span> ${item.price}
                </p>
                <p>
                  <span className="font-bold">Discount:</span>{" "}
                  {item.discount > 0 ? `$${item.discount}` : "None"}
                </p>
                <p>
                  <span className="font-bold">Final Price:</span> $
                  {item.finalPrice}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Order Status Section */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-6">
        <p className="w-full sm:w-1/2">
          {" "}
          <h3 className="text-xl font-semibold mb-2 ">Order Status</h3>
          <span className="capitalize block">{order.status}</span>
        </p>
        <p className="w-full sm:w-1/2">
          <h3 className="text-xl font-semibold mb-2">Total Price</h3>
          <span className="capitalize block">
            ${order.totalPrice.toFixed(2)}
          </span>
        </p>
      </div>

      {/* Invoice Section */}
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-2">Invoice</h3>
        <Link
          href={order.invoiceLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          View Invoice
        </Link>
      </div>
    </div>
    // </div>
  );
};

export default UserOrderTracking;
