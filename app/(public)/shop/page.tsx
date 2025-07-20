import type { Metadata } from "next";
import { headers } from "next/headers";

import { api_gql } from "@/app/lib/utilities/api.graphql";
import { lang } from "@/app/lib/utilities/lang";
import ErrorHandler from "@/components/Error/errorHandler";
import Shop from "@/components/shop/shop";
import { shopPageTranslate } from "@/public/locales/client/(public)/shop/shoppageTranslate";

export const metadata: Metadata = {
  title: shopPageTranslate[lang].shopPage.Metadata.title,
  description: shopPageTranslate[lang].shopPage.Metadata.description,
  keywords: shopPageTranslate[lang].shopPage.Metadata.keywords,
};
type SearchParams = {
  category?: string;
  name?: string;
  search?: string;
  sort?: string;
  fields?: string;
  page?: string;
  limit?: string;
  rating?: string;
  min?: string;
  max?: string;
};
const GET__FULL_PRODUCTS = `
  query GetProducts($filter: SearchParams) {
    getProducts(filter: $filter) {
      products {
        docs {
          _id
          name
          category
          price
          discount
          discount_expire
          description
          ratings_average
          ratings_quantity
          slug

          images {
            _id
            link
            public_id
          }
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
          first
          prev
          next
          last
        }
      }
      categories
    }
  }
`;
const queryParams = async (searchParams: SearchParams) => {
  const filter = {
    ...searchParams,
    page: searchParams.page ? +searchParams.page : undefined,
    limit: searchParams.limit ? +searchParams.limit : undefined,
    rating: searchParams.rating ? +searchParams.rating : undefined,
  };
  const {
    getProducts: {
      products: { docs, meta, links },
      categories,
    },
  } = await api_gql<{
    getProducts: {
      products: { docs: any[]; meta: any; links: any };
      categories: any[];
    };
  }>(
    GET__FULL_PRODUCTS,
    { filter },
    Object.fromEntries((await headers()).entries())
  );

  return {
    docs,
    pagination: {
      meta,
      links,
    },
    categories,
  };
};

const page = async (props: { searchParams: Promise<SearchParams> }) => {
  const searchParams = await props.searchParams;
  try {
    const { docs, categories, pagination } = await queryParams(searchParams);

    return (
      <Shop
        products={docs || []}
        categories={categories || []}
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
      />
    );
  } catch (error: unknown) {
    const { message } = error as Error;
    return <ErrorHandler message={message} />;
  }
};

export default page;
