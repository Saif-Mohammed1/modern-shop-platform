import type { Metadata } from "next";
import { headers } from "next/headers";

import api from "@/app/lib/utilities/api";
import { lang } from "@/app/lib/utilities/lang";
import ErrorHandler from "@/components/Error/errorHandler";
import Shop from "@/components/shop/shop";
import { shopPageTranslate } from "@/public/locales/client/(public)/shop/shoppageTranslate";

// import ComponentLoading from "@/components/spinner/componentLoading";//no need this we use next loading

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
  // const url = new URLSearchParams();

  // // Append each parameter only if it's not undefined
  // if (searchParams.category !== undefined) {
  //   url.append("category", searchParams.category);
  // }
  // if (searchParams.name !== undefined) {
  //   url.append("name", searchParams.name);
  // }
  // if (searchParams.search !== undefined) {
  //   url.append("search", searchParams.search);
  // }
  // if (searchParams.sort !== undefined) {
  //   url.append("sort", searchParams.sort);
  // }
  // if (searchParams.fields !== undefined) {
  //   url.append("fields", searchParams.fields);
  // }
  // if (searchParams.page !== undefined) {
  //   url.append("page", searchParams.page);
  // }
  // if (searchParams.limit !== undefined) {
  //   url.append("limit", searchParams.limit);
  // }
  // if (searchParams.rating !== undefined) {
  //   url.append("rating[gte]", searchParams.rating);
  //   url.append("rating[lte]", "5");
  //   // url.append("sort", "-ratings_average");
  // }
  // // if (searchParams.min !== undefined) {
  // //   url.append("price[gte]", searchParams.min);
  // // }
  // // if (searchParams.max !== undefined) {
  // //   url.append("price[lte]", searchParams.max);
  // // }

  // const queryString = url.toString();
  const filter = {
    ...searchParams,
    page: searchParams.page ? +searchParams.page : undefined,
    limit: searchParams.limit ? +searchParams.limit : undefined,
    rating: searchParams.rating ? +searchParams.rating : undefined,
  };
  const {
    data: {
      data: {
        getProducts: {
          products: { docs, meta, links },
          categories,
        },
      },
    },
  } = await api.post("/graphql", {
    query: GET__FULL_PRODUCTS,
    variables: { filter },
    headers: Object.fromEntries((await headers()).entries()), // convert headers to object
  });

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
    // await new Promise<void>((resolve) => {
    //   setTimeout(() => {
    //     resolve();
    //   }, 12000); // Simulate a 12-second delay
    // });
    // console.log("docs", docs);
    return (
      // <ComponentLoading>
      // </ComponentLoading>
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
