import type { Metadata } from "next";
import { headers } from "next/headers";

import type { OrderType } from "@/app/lib/types/orders.db.types";
import { api_gql } from "@/app/lib/utilities/api.graphql";
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
const GET_MY_ORDERS = /* GraphQL */ `
  query ($filter: OrderFilter) {
    getOrdersByUserId(filter: $filter) {
      docs {
        _id
        user_id
        payment {
          method
          transaction_id
        }
        status
        invoice_id
        invoice_link
        subtotal
        tax
        total
        currency
        order_notes
        cancellation_reason
        created_at
        shipping_address {
          street
          city
          state
          postal_code
          phone
          country
        }
        items {
          product_id
          name
          price
          discount
          quantity
          sku
          shipping_info_weight
          shipping_info_dimensions {
            length
            width
            height
          }
          final_price
          attributes
        }
      }
      meta {
        total
        page
        limit
        hasNext
      }
    }
  }
`;
const page = async (props: Props) => {
  const searchParams = await props.searchParams;
  const headersObj = Object.fromEntries((await headers()).entries()); //convert headers to javascript object
  try {
    const { page = "1" } = searchParams || {};
    const { getOrdersByUserId } = await api_gql<{
      getOrdersByUserId: {
        docs: OrderType[];
        meta: { total: number; page: number; limit: number; hasNext: boolean };
      };
    }>(
      GET_MY_ORDERS,
      {
        filter: {
          page: +page,
          limit: 10,
        },
      },
      headersObj
    );
    const orders = getOrdersByUserId.docs;
    const { meta } = getOrdersByUserId;

    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-semibold mb-6 text-center">
          {accountOrdersTranslate[lang].title}
        </h1>
        {/* <div className="max-h-[80vh] overflow-y-auto"> */}
        {/* <OrderHistory ordersList={orders} />; */}
        {orders.length > 0 ? (
          <UserOrderTracking orders={orders} hasNextPage={meta.hasNext} />
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
