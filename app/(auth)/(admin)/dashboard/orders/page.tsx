import type { Metadata } from "next";
import { headers } from "next/headers";
import type { FC } from "react";

import type { OrderType } from "@/app/lib/types/orders.db.types";
import { api_gql } from "@/app/lib/utilities/api.graphql";
import { lang } from "@/app/lib/utilities/lang";
import AdminOrdersDashboard from "@/components/(admin)/dashboard/orders/orderMangement";
import ErrorHandler from "@/components/Error/errorHandler";
import { ordersTranslate } from "@/public/locales/client/(auth)/(admin)/dashboard/ordersTranslate";

export const metadata: Metadata = {
  title: ordersTranslate.metadata[lang].title,
  description: ordersTranslate.metadata[lang].description,
  keywords: ordersTranslate.metadata[lang].keywords,
};
type SearchParams = {
  email?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  sort?: string;
  page?: string;
  limit?: string;
};
const GET_ORDERS = /* GraphQL */ `
  query ($filter: AdminOrderFilter) {
    getOrdersByAdmin(filter: $filter) {
      docs {
        _id
        user_id
        user_info {
          name
          email
        }
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
        hasPrev
        totalPages
      }
      links {
        first
        prev
      }
    }
  }
`;
// const queryParams = async (searchParams: SearchParams) => {
//   const url = new URLSearchParams();

//   // Append each parameter only if it's not undefined
//   if (searchParams.email !== undefined) {
//     url.append("email", searchParams.email);
//   }
//   if (searchParams.status !== undefined) {
//     url.append("status", searchParams.status);
//   }
//   if (searchParams.startDate !== undefined) {
//     url.append("created_at[gte]", searchParams.startDate);
//   }
//   if (searchParams.endDate !== undefined) {
//     url.append("created_at[lte]", searchParams.endDate);
//   }
//   if (searchParams.sort !== undefined) {
//     url.append("sort", searchParams.sort);
//   }

//   if (searchParams.page !== undefined) {
//     url.append("page", searchParams.page);
//   }
//   if (searchParams.limit !== undefined) {
//     url.append("limit", searchParams.limit);
//   }

//   const queryString = url.toString();

//   // const {
//   //   orders, pageCount
//   // }
//   const {
//     data: { docs, meta, links },
//   } = await api.get(
//     `/admin/dashboard/orders${queryString ? `?${queryString}` : ""}`,
//     {
//       headers: Object.fromEntries((await headers()).entries()), // Convert ReadonlyHeaders to plain object
//     }
//   );

//   return { orders: docs, pagination: { meta, links } };
// };
type PageProps = {
  searchParams: Promise<SearchParams>;
};
const page: FC<PageProps> = async (props) => {
  const searchParams = await props.searchParams;
  const headersObject = Object.fromEntries((await headers()).entries());
  const defaultSearchParams = {
    email: searchParams.email || undefined,
    status: searchParams.status || undefined,
    startDate: searchParams.startDate || undefined,
    endDate: searchParams.endDate || undefined,
    sort: searchParams.sort || undefined,
    page: searchParams?.page ? +searchParams.page : undefined,
    limit: searchParams?.limit ? +searchParams.limit : undefined,
  };

  try {
    const { getOrdersByAdmin } = await api_gql<{
      getOrdersByAdmin: {
        docs: OrderType[];
        meta: {
          total: number;
          page: number;
          limit: number;
          hasNext: boolean;
          hasPrev: boolean;
          totalPages: number;
        };
        links: {
          prev: string;
          first: string;
        };
      };
    }>(
      GET_ORDERS,

      {
        filter: defaultSearchParams,
      },
      headersObject
    );
    return (
      <AdminOrdersDashboard
        initialOrders={getOrdersByAdmin.docs}
        pagination={{
          meta: getOrdersByAdmin.meta || {
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          },
          links: getOrdersByAdmin.links || {
            prev: "",
            first: "",
          },
        }}
      />
    );
  } catch (error: unknown) {
    const { message } = error as Error;
    return <ErrorHandler message={message} />;
  }
};

export default page;
