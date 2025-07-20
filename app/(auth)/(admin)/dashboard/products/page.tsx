// pages/admin/products.js
import type { Metadata } from "next";
import { headers } from "next/headers";

import type {
  AdminProductType,
  ProductsSearchParams,
} from "@/app/lib/types/products.types";
import { api_gql } from "@/app/lib/utilities/api.graphql";
import { lang } from "@/app/lib/utilities/lang";
import AdminProducts from "@/components/(admin)/dashboard/products/adminProduct";
import ErrorHandler from "@/components/Error/errorHandler";
import { productsTranslate } from "@/public/locales/client/(auth)/(admin)/dashboard/productTranslate";

export const metadata: Metadata = {
  title: productsTranslate.metadata[lang].title,
  description: productsTranslate.metadata[lang].description,
  keywords: productsTranslate.metadata[lang].keywords,
};

type Props = {
  searchParams: Promise<{ [key: string]: string | undefined }>;
};

// GraphQL query for admin products
const GET_ADMIN_PRODUCTS = `
  query GetAdminProducts($filter: SearchParams) {
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
          stock
          ratings_average
          ratings_quantity
          slug
          reserved
          sold
          sku
          created_at
          active
          last_reserved
          last_modified_by {
            _id
            name
          }
          images {
            _id
            link
            public_id
          }
          shipping_info {
            weight
            dimensions {
              length
              width
              height
            }
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
          previous
          next
          first
          prev
        }
      }
      categories
    }
  }
`;

const page = async (props: Props) => {
  const searchParams = await props.searchParams;
  // const defaultSearchParams = {
  //   category: searchParams.category || undefined,
  //   name: searchParams.name || undefined,
  //   sort: searchParams.sort || undefined,
  //   fields: searchParams.fields || undefined,
  //   page: searchParams.page || undefined,
  //   limit: searchParams.limit || undefined,
  //   rating: searchParams.rating || undefined,
  //   min: searchParams.min || undefined,
  //   max: searchParams.max || undefined,
  // };
  const headersObj = Object.fromEntries((await headers()).entries());

  // Create a clean filter object with default values and undefined for unset values
  const filter: ProductsSearchParams = {
    category: searchParams.category || undefined,
    search: searchParams.search || undefined,
    sort: searchParams.sort || undefined,
    fields: searchParams.fields || undefined,
    page: searchParams.page ? +searchParams.page : undefined,
    limit: searchParams.limit ? +searchParams.limit : undefined,
    rating: searchParams.rating ? +searchParams.rating : undefined,
    //  min: searchParams.min ? +searchParams.min : undefined,
    //  max: searchParams.max ? +searchParams.max : undefined,
  };

  // Remove undefined values to keep the object clean

  try {
    const { getProducts } = await api_gql<{
      getProducts: {
        products: {
          docs: AdminProductType[];
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
        categories: string[];
      };
    }>(GET_ADMIN_PRODUCTS, { filter }, headersObj);

    return (
      <div className="p-8 bg-gray-100 min-h-screen">
        <h1 className="text-3xl font-bold mb-6">
          {productsTranslate.products[lang].title}
        </h1>
        {/* <ProductTicket
      //products={products}
      /> */}
        <AdminProducts
          products={getProducts.products.docs}
          categories={getProducts.categories}
          pagination={{
            meta: getProducts.products.meta || {
              total: 0,
              page: 0,
              limit: 0,
              totalPages: 0,
              hasNext: false,
              hasPrev: false,
            },
            links: getProducts.products.links || {
              previous: "",
              next: "",
              first: "",
              prev: "",
            },
          }}
        />
      </div>
    );
  } catch (error: unknown) {
    const { message } = error as Error;
    return <ErrorHandler message={message} />;
  }
};
export default page;
