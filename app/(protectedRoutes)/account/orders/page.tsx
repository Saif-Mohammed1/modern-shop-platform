// import OrderHistory from "@/components/shop/orders/orderHistory";
export const dynamic = "force-dynamic";
import UserOrderTracking from "@/components/shop/orders/orderTracking";
import api from "@/components/util/axios.api";
// import AppError from "@/components/util/appError";
import ErrorHandler from "@/components/Error/errorHandler";
import { headers } from "next/headers";
import type { Metadata } from "next";
import {
  accountOrdersTranslate,
  OrdersType,
} from "@/app/_translate/(protectedRoute)/account/ordersTranslate";
import { lang } from "@/components/util/lang";
export const metadata: Metadata = {
  title: accountOrdersTranslate[lang].metadata.title,
  description: accountOrdersTranslate[lang].metadata.description,
  keywords: accountOrdersTranslate[lang].metadata.keywords,
};
const page = async () => {
  try {
    const { data } = await api.get("/customer/orders", {
      headers: Object.fromEntries(headers().entries()), //convert headers to javascript object
    });
    const orders = data.data;
    // return <OrderHistory ordersList={orders} />;
    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-semibold mb-6 text-center">
          {accountOrdersTranslate[lang].title}
        </h1>
        <div className="max-h-[80vh] overflow-y-auto">
          {/* <OrderHistory ordersList={orders} />; */}

          {orders.length > 0 ? (
            orders.map((order: OrdersType) => (
              <UserOrderTracking order={order} />
            ))
          ) : (
            // <h1 className="text-3xl font-semibold mb-6 text-center">
            <h1 className="empty">
              {accountOrdersTranslate[lang].noOrdersFound}
            </h1>
          )}
        </div>
      </div>
    );
  } catch (error: any) {
    return <ErrorHandler message={error?.message} />;

    // throw new AppError(error.message, error.status);
  }
};
export default page;
