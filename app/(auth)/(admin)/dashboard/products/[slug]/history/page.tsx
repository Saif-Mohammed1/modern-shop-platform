import { headers } from "next/headers";

import { api_gql } from "@/app/lib/utilities/api.graphql";
import ErrorHandler from "@/components/Error/errorHandler";
import ProductVersionHistory from "@/components/products/ProductVersionHistory";

type SearchParams = {
  sort?: string;
  page?: string;
  limit?: string;
  actor?: string;
  action?: string;
};

// GraphQL query for product history
const GET_PRODUCT_HISTORY = `
  query GetProductHistory($slug: String!, $productHistoryFilter: ProductHistoryFilterInput) {
    getProductHistory(slug: $slug, productHistoryFilter: $productHistoryFilter) {
      docs {
        versionId
        timestamp
        name
        price
        discount
        stock
        description
      }
      meta {
        total
        page
        limit
        totalPages
        hasNext
        hasPrev
      }
      links {
        prev
        next
      }
    }
  }
`;

const queryParams = async (slug: string, searchParams: SearchParams) => {
  const headersObj = Object.fromEntries((await headers()).entries());

  // Create a clean filter object with default values and undefined for unset values
  const productHistoryFilter: Record<string, any> = {
    sort: searchParams.sort || undefined,
    page: searchParams.page ? +searchParams.page : undefined,
    limit: searchParams.limit ? +searchParams.limit : undefined,
    actor: searchParams.actor || undefined,
    action: searchParams.action || undefined,
  };

  try {
    const { getProductHistory } = await api_gql<{
      getProductHistory: {
        docs: Array<{
          versionId: string;
          timestamp: string;
          name: string;
          price: number;
          discount: number;
          stock: number;
          description: string;
        }>;
        meta: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
          hasNext: boolean;
          hasPrev: boolean;
        };
        links: {
          previous: string;
          next: string;
          first: string;
          prev: string;
        };
      };
    }>(GET_PRODUCT_HISTORY, { slug, productHistoryFilter }, headersObj);

    return {
      docs: getProductHistory.docs,
      pagination: {
        meta: getProductHistory.meta,
        links: getProductHistory.links,
      },
    };
  } catch (_error) {
    // Fallback: if GraphQL query doesn't exist yet, return empty data
    return {
      docs: [],
      pagination: {
        meta: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
        links: { previous: "", next: "", first: "", prev: "" },
      },
    };
  }
};
const page = async (props: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
}) => {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const { slug } = params;

  try {
    const { docs, pagination } = await queryParams(slug, searchParams);

    return (
      <ProductVersionHistory
        pagination={
          pagination || {
            meta: {
              total: 0,
              page: 0,
              limit: 0,
              totalPages: 0,
              hasNext: false,
              hasPrev: false,
            },
            links: { previous: "", next: "" },
          }
        }
        slug={slug}
        versions={docs}
      />
    );
  } catch (error: unknown) {
    const { message } = error as Error;
    return <ErrorHandler message={message} />;
  }
};
export default page;
