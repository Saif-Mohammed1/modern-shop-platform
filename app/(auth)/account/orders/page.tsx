// import OrderHistory from "@/components/shop/orders/orderHistory";
export const dynamic = "force-dynamic";
import UserOrderTracking from "@/components/shop/orders/orderTracking";
import api from "@/app/lib/utilities/api";
// import AppError from "@/components/util/appError";
import ErrorHandler from "@/components/Error/errorHandler";
import { headers } from "next/headers";
import type { Metadata } from "next";
import {
  accountOrdersTranslate,
  OrdersType,
} from "@/public/locales/client/(auth)/account/ordersTranslate";
import { lang } from "@/app/lib/utilities/lang";
export const metadata: Metadata = {
  title: accountOrdersTranslate[lang].metadata.title,
  description: accountOrdersTranslate[lang].metadata.description,
  keywords: accountOrdersTranslate[lang].metadata.keywords,
};
type Props = {
  searchParams: { page?: string };
};
const page = async ({ searchParams }: Props) => {
  const url = new URLSearchParams();
  if (searchParams.page !== undefined) {
    url.append("page", searchParams.page);
  }
  try {
    const queryString = url.toString();

    const { data } = await api.get(
      "/customer/orders" + (queryString ? `?${queryString}` : ""),
      {
        headers: Object.fromEntries(headers().entries()), //convert headers to javascript object
      }
    );
    const orders = data.data;
    // return <OrderHistory ordersList={orders} />;
    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-semibold mb-6 text-center">
          {accountOrdersTranslate[lang].title}
        </h1>
        {/* <div className="max-h-[80vh] overflow-y-auto"> */}
        {/* <OrderHistory ordersList={orders} />; */}

        {orders.length > 0 ? (
          <UserOrderTracking orders={orders} hasNextPage={data.hasNextPage} />
        ) : (
          // <h1 className="text-3xl font-semibold mb-6 text-center">
          <h1 className="empty">
            {accountOrdersTranslate[lang].noOrdersFound}
          </h1>
        )}
      </div>
    );
  } catch (error: any) {
    return <ErrorHandler message={error?.message} />;

    // throw new AppError(error.message, error.status);
  }
};
export default page;
