import {
  accountOrdersTranslate,
  OrdersType,
} from "@/app/_translate/(protectedRoute)/account/ordersTranslate";
import { lang } from "@/components/util/lang";
import Link from "next/link";
import FetchMoreOrders from "./fetchMoreOrders";

const UserOrderTracking = ({
  orders,
  hasNextPage,
}: {
  orders: OrdersType[];
  hasNextPage: boolean;
}) => {
  // if (!order) {
  //   return (
  //     <p className="text-center mt-6">
  //       {accountOrdersTranslate[lang].noOrdersFound}
  //     </p>
  //   );
  // }
  return (
    // <div className="container mx-auto px-4 py-6">
    //   <h1 className="text-3xl font-semibold mb-6 text-center">
    //     Track Your Order
    //   </h1>
    <>
      <div className="max-h-[80vh] overflow-y-auto">
        {orders.map((order) => (
          <div
            className="border p-6 rounded shadow-lg bg-white"
            key={order._id}
          >
            <h2 className="text-2xl font-bold mb-4">
              {accountOrdersTranslate[lang].orderTracking.orderId}
              {order._id}
            </h2>

            {/* Shipping Info Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  {
                    accountOrdersTranslate[lang].orderTracking.shippingInfo
                      .title
                  }
                </h3>
                <p>{order.shippingInfo.street}</p>
                <p>
                  {order.shippingInfo.city}, {order.shippingInfo.state}
                </p>
                <p>{order.shippingInfo.postalCode}</p>
                <p>{order.shippingInfo.country}</p>
                <p>
                  {
                    accountOrdersTranslate[lang].orderTracking.shippingInfo
                      .phone
                  }
                  : {order.shippingInfo.phone}
                </p>
              </div>

              {/* Items Section */}
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  {accountOrdersTranslate[lang].orderTracking.items.title}
                </h3>
                <ul className="space-y-4">
                  {order.items.map((item) => (
                    <li
                      key={item._id}
                      className="border-b pb-4 mb-4 last:border-b-0 last:mb-0"
                    >
                      <p>
                        <span className="font-bold">
                          {
                            accountOrdersTranslate[lang].orderTracking.items
                              .name
                          }
                          :
                        </span>{" "}
                        {item.name}
                      </p>
                      <p>
                        <span className="font-bold">
                          {
                            accountOrdersTranslate[lang].orderTracking.items
                              .quantity
                          }
                          :
                        </span>{" "}
                        {item.quantity}
                      </p>
                      <p>
                        <span className="font-bold">
                          {
                            accountOrdersTranslate[lang].orderTracking.items
                              .price
                          }
                          :
                        </span>{" "}
                        ${item.price}
                      </p>
                      <p>
                        <span className="font-bold">
                          {
                            accountOrdersTranslate[lang].orderTracking.items
                              .discount
                          }
                          :
                        </span>{" "}
                        {item.discount > 0
                          ? `$${item.discount}`
                          : accountOrdersTranslate[lang].orderTracking.items
                              .existDiscount}
                      </p>
                      <p>
                        <span className="font-bold">
                          {
                            accountOrdersTranslate[lang].orderTracking.items
                              .finalPrice
                          }
                          :
                        </span>{" "}
                        ${item.finalPrice}
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
                <h3 className="text-xl font-semibold mb-2 ">
                  {accountOrdersTranslate[lang].orderTracking.orderStatus.title}
                </h3>
                <span className="capitalize block">{order.status}</span>
              </p>
              <p className="w-full sm:w-1/2">
                <h3 className="text-xl font-semibold mb-2">
                  {
                    accountOrdersTranslate[lang].orderTracking.orderStatus
                      .totalPrice
                  }
                </h3>
                <span className="capitalize block">${order.totalPrice}</span>
              </p>
            </div>

            {/* Invoice Section */}
            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-2">
                {accountOrdersTranslate[lang].orderTracking.invoice.title}
              </h3>
              <Link
                href={order.invoiceLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                {accountOrdersTranslate[lang].orderTracking.invoice.viewInvoice}
              </Link>
            </div>
          </div>
          //{" "}
          // </div>
        ))}
      </div>
      <FetchMoreOrders
        showMore={hasNextPage}
        // getMoreResults={getMoreResults}
        // loading={loading}
      />
    </>
  );
};

export default UserOrderTracking;
