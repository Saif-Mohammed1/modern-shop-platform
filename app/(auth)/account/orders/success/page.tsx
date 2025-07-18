import type { Metadata } from "next";
import { headers } from "next/headers";

import type { OrderType } from "@/app/lib/types/orders.db.types";
import { api_gql } from "@/app/lib/utilities/api.graphql";
import { lang } from "@/app/lib/utilities/lang";
import ErrorHandler from "@/components/Error/errorHandler";
import OrderCompleted from "@/components/shop/orders/orderCompletedPrushers";
import { accountOrdersTranslate } from "@/public/locales/client/(auth)/account/ordersTranslate";

export const metadata: Metadata = {
  title: accountOrdersTranslate[lang].orderCompleted.metadata.title,
  description: accountOrdersTranslate[lang].orderCompleted.metadata.description,
  keywords: accountOrdersTranslate[lang].orderCompleted.metadata.keywords,
};
const GET_LATEST_ORDER = `
query {
    getLatestOrder {
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
        }
    }
}

`;
const page = async () => {
  const headersObj = Object.fromEntries((await headers()).entries());
  try {
    const { getLatestOrder } = await api_gql<{
      getLatestOrder: OrderType;
    }>(GET_LATEST_ORDER, undefined, headersObj);

    return <OrderCompleted order={getLatestOrder} />;
  } catch (error: unknown) {
    const { message } = error as Error;
    return <ErrorHandler message={message} />;

    // throw new AppError(error.message, error.status);
  }
};

export default page;
