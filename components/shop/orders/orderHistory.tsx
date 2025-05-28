import Link from "next/link";

import type { OrderType } from "@/app/lib/types/orders.db.types";
import { lang } from "@/app/lib/utilities/lang";
import { accountOrdersTranslate } from "@/public/locales/client/(auth)/account/ordersTranslate";

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
              <div className="mb-2">
                <strong>
                  {
                    accountOrdersTranslate[lang].orderHistory.order.products
                      .title
                  }
                  :
                </strong>
                <ul className="list-disc list-inside">
                  {order.items.map((item) => (
                    <li key={item.product_id.toString()}>
                      <Link
                        href={`/shop/${item.product_id.toString()}`}
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
              </div>
              <p className="mb-2">
                <strong>
                  {
                    accountOrdersTranslate[lang].orderHistory.order
                      .shipping_info.title
                  }
                  :
                </strong>{" "}
                {order.shipping_address.street}, {order.shipping_address.city},{" "}
                {order.shipping_address.state},{" "}
                {order.shipping_address.postal_code}
              </p>
              <p className="mb-2">
                <strong>
                  {
                    accountOrdersTranslate[lang].orderHistory.order
                      .shipping_info.phone
                  }
                  :
                </strong>{" "}
                {order.shipping_address.phone}
              </p>
              <p className="mb-2">
                <strong>
                  {accountOrdersTranslate[lang].orderHistory.order.amount}:
                </strong>{" "}
                ${order.total.toFixed(2)}
              </p>
              <Link
                href={order.invoice_link}
                className="text-blue-500 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {accountOrdersTranslate[lang].orderHistory.order.viewInvoice}
              </Link>
              <p className="text-gray-500 text-sm">
                {accountOrdersTranslate[lang].orderHistory.order.orderedOn}:{" "}
                {new Date(order.created_at).toLocaleDateString()}
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
