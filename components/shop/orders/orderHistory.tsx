import { accountOrdersTranslate } from "@/public/locales/client/(auth)/account/ordersTranslate";
import { lang } from "@/app/lib/utilities/lang";
import Link from "next/link";
import type { OrderType } from "@/app/lib/types/orders.types";

const OrderHistory = ({ ordersList }: { ordersList: OrderType[] }) => {
  return (
    <div className="container mx-auto mt-1 p-4 bg-gray-100 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6">
        {accountOrdersTranslate[lang].orderHistory.title}
      </h1>
      <div className="max-h-[80vh] overflow-y-auto">
        {ordersList.length > 0 ? (
          ordersList.map((order) => (
            <div
              key={order._id}
              className="p-4 mb-4 bg-white rounded shadow-lg border border-gray-200"
            >
              <h2 className="text-xl font-semibold mb-2">
                {accountOrdersTranslate[lang].orderHistory.order.orderId}
                {order._id}
              </h2>
              <p className="mb-2">
                <strong>
                  {accountOrdersTranslate[lang].orderHistory.order.status}:
                </strong>{" "}
                {order.status}
              </p>
              <p className="mb-2">
                <strong>
                  {
                    accountOrdersTranslate[lang].orderHistory.order.products
                      .title
                  }
                  :
                </strong>
                <ul className="list-disc list-inside">
                  {order.items.map((item) => (
                    <li key={item.productId.toString()}>
                      <Link
                        href={`/shop/${item.productId.toString()}`}
                        target="_blank"
                        className="text-blue-500 hover:underline"
                      >
                        {" "}
                        {item.name}{" "}
                      </Link>
                      -{" "}
                      {
                        accountOrdersTranslate[lang].orderHistory.order.products
                          .quantity
                      }
                      : {item.quantity}
                    </li>
                  ))}
                </ul>
              </p>
              <p className="mb-2">
                <strong>
                  {
                    accountOrdersTranslate[lang].orderHistory.order.shippingInfo
                      .title
                  }
                  :
                </strong>{" "}
                {order.shippingAddress.street}, {order.shippingAddress.city},{" "}
                {order.shippingAddress.state},{" "}
                {order.shippingAddress.postalCode}
              </p>
              <p className="mb-2">
                <strong>
                  {
                    accountOrdersTranslate[lang].orderHistory.order.shippingInfo
                      .phone
                  }
                  :
                </strong>{" "}
                {order.shippingAddress.phone}
              </p>
              <p className="mb-2">
                <strong>
                  {accountOrdersTranslate[lang].orderHistory.order.amount}:
                </strong>{" "}
                ${order.total.toFixed(2)}
              </p>
              <Link
                href={order.invoiceLink}
                className="text-blue-500 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {accountOrdersTranslate[lang].orderHistory.order.viewInvoice}
              </Link>
              <p className="text-gray-500 text-sm">
                {accountOrdersTranslate[lang].orderHistory.order.orderedOn}:{" "}
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))
        ) : (
          <p className="empty">
            {accountOrdersTranslate[lang].orderHistory.noOrdersFound}
          </p>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
