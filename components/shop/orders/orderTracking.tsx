import type { OrderType } from "@/app/lib/types/orders.db.types";
import { lang } from "@/app/lib/utilities/lang";
import { accountOrdersTranslate } from "@/public/locales/client/(auth)/account/ordersTranslate";

import FetchMoreOrders from "./fetchMoreOrders";
import OrderCard from "./orderCard";

const UserOrderTracking = ({
  orders,
  hasNextPage,
}: {
  orders: OrderType[];
  hasNextPage: boolean;
}) => {
  // const UserOrderTracking = ({
  //   orders,
  //   hasNextPage,
  // }: {
  //   orders: OrderType[];
  //   hasNextPage: boolean;
  // }) => {
  const t = accountOrdersTranslate[lang].orderTracking;

  if (orders.length === 0) {
    return (
      <p className="text-center mt-6">
        {accountOrdersTranslate[lang].noOrdersFound}
      </p>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* <h1 className="text-3xl font-semibold mb-6 text-center">
        {accountOrdersTranslate[lang].title}
      </h1> */}

      <div className="max-h-[80vh] overflow-y-auto space-y-6">
        {orders.map((order) => (
          <OrderCard key={order._id} order={order} t={t} />
        ))}
      </div>

      <FetchMoreOrders showMore={hasNextPage} />
    </div>
  );
};

export default UserOrderTracking;
