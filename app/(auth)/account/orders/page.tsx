import type { Metadata } from "next";
import { headers } from "next/headers";

import type { OrderType } from "@/app/lib/types/orders.db.types";
import api from "@/app/lib/utilities/api";
import { lang } from "@/app/lib/utilities/lang";
import ErrorHandler from "@/components/Error/errorHandler";
import UserOrderTracking from "@/components/shop/orders/orderTracking";
import { accountOrdersTranslate } from "@/public/locales/client/(auth)/account/ordersTranslate";

// import OrderHistory from "@/components/shop/orders/orderHistory";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: accountOrdersTranslate[lang].metadata.title,
  description: accountOrdersTranslate[lang].metadata.description,
  keywords: accountOrdersTranslate[lang].metadata.keywords,
};
type Props = {
  searchParams: Promise<{ page?: string }>;
};
const page = async (props: Props) => {
  const searchParams = await props.searchParams;
  const url = new URLSearchParams();
  if (searchParams.page !== undefined) {
    url.append("page", searchParams.page);
  }
  try {
    const queryString = url.toString();

    const {
      data,
    }: {
      data: {
        docs: OrderType[];
        meta: {
          hasNext: boolean;
        };
      };
    } = await api.get(
      `/customers/orders${queryString ? `?${queryString}` : ""}`,
      {
        headers: Object.fromEntries((await headers()).entries()), //convert headers to javascript object
      }
    );
    const orders = data.docs;
    // return <OrderHistory ordersList={orders} />;
    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-semibold mb-6 text-center">
          {accountOrdersTranslate[lang].title}
        </h1>
        {/* <div className="max-h-[80vh] overflow-y-auto"> */}
        {/* <OrderHistory ordersList={orders} />; */}
        {orders.length > 0 ? (
          <UserOrderTracking orders={orders} hasNextPage={data.meta.hasNext} />
        ) : (
          // <h1 className="text-3xl font-semibold mb-6 text-center">
          <h1 className="empty">
            {accountOrdersTranslate[lang].noOrdersFound}
          </h1>
        )}
      </div>
    );
  } catch (error: unknown) {
    const { message } = error as Error;
    return <ErrorHandler message={message} />;
  }
};
export default page;
