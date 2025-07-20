import type { Metadata } from "next";
import { headers } from "next/headers";

import type { OrderType } from "@/app/lib/types/orders.db.types";
// import AppError from "@/components/util/appError";
import { api_gql } from "@/app/lib/utilities/api.graphql";
import { lang } from "@/app/lib/utilities/lang";
import AdminOrderDetails from "@/components/(admin)/dashboard/orders/OrderDetails";
import ErrorHandler from "@/components/Error/errorHandler";
import { ordersTranslate } from "@/public/locales/client/(auth)/(admin)/dashboard/ordersTranslate";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
};
const GET_METADATA = /* GraphQL */ `
  query ($id: String!) {
    getOrderById(id: $id) {
      _id
      user_info {
        name
      }
    }
  }
`;
const GET_ORDER = /* GraphQL */ `
  query ($id: String!) {
    getOrderById(id: $id) {
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
  }
`;
export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const { id } = params;
  const headersObj = Object.fromEntries((await headers()).entries()); // Convert ReadonlyHeaders to plain object
  try {
    const { getOrderById } = await api_gql<{
      getOrderById: OrderType;
    }>(
      GET_METADATA,
      { id },

      headersObj
    );
    return {
      title: `${getOrderById?.user_info?.name} - ${ordersTranslate.orders[lang].details.metadata.title}`,
      description: ordersTranslate.orders[lang].details.metadata.description,
      keywords: ordersTranslate.orders[lang].details.metadata.keywords,
    };
  } catch (_error) {
    return {
      title: ordersTranslate.orders[lang].details.metadata.title,
      description: ordersTranslate.orders[lang].details.metadata.description,
      keywords: ordersTranslate.orders[lang].details.metadata.keywords,
    };
  }
}

const page = async (props: Props) => {
  const params = await props.params;
  const { id } = params;
  const headersObj = Object.fromEntries((await headers()).entries()); // Convert ReadonlyHeaders to plain object

  try {
    const { getOrderById: data } = await api_gql<{ getOrderById: OrderType }>(
      GET_ORDER,
      { id },

      headersObj
    );

    return <AdminOrderDetails order={data} />;
  } catch (error: unknown) {
    const { message } = error as Error;
    return <ErrorHandler message={message} />;
  }
};

export default page;
