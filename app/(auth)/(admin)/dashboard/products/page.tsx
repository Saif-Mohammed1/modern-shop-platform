// pages/admin/products.js

import ErrorHandler from "@/components/Error/errorHandler";
import AdminProducts from "@/components/(admin)/dashboard/products/adminProduct";
import AppError from "@/app/lib/utilities/appError";
import api from "@/app/lib/utilities/api";
import { headers } from "next/headers";
import { productsTranslate } from "@/public/locales/client/(auth)/(admin)/dashboard/productTranslate";
import { lang } from "@/app/lib/utilities/lang";
import type { Metadata } from "next";
import type { ProductsSearchParams } from "@/app/lib/types/products.types";
export const metadata: Metadata = {
  title: productsTranslate.metadata[lang].title,
  description: productsTranslate.metadata[lang].description,
  keywords: productsTranslate.metadata[lang].keywords,
};

type Props = {
  searchParams: Promise<{ [key: string]: string | undefined }>;
};
const queryParams = async (searchParams: ProductsSearchParams) => {
  const url = new URLSearchParams();

  // Append each parameter only if it's not undefined
  if (searchParams.category !== undefined) {
    url.append("category", searchParams.category);
  }
  if (searchParams.search !== undefined) {
    url.append("search", searchParams.search);
  }
  if (searchParams.sort !== undefined) {
    url.append("sort", searchParams.sort);
  }
  if (searchParams.fields !== undefined) {
    url.append("fields", searchParams.fields);
  }
  if (searchParams.page !== undefined) {
    url.append("page", searchParams.page);
  }
  if (searchParams.limit !== undefined) {
    url.append("limit", searchParams.limit);
  }
  if (searchParams.rating !== undefined) {
    url.append("rating", searchParams.rating);
  }
  // if (searchParams.min !== undefined) {
  //   url.append("price[gte]", searchParams.min);
  // }
  // if (searchParams.max !== undefined) {
  //   url.append("price[lte]", searchParams.max);
  // }

  const queryString = url.toString();
  try {
    const {
      data: {
        products: { docs, meta, links },

        categories,
      },
    } = await api.get(
      "/admin/dashboard/products/" + (queryString ? `?${queryString}` : ""),
      {
        headers: Object.fromEntries((await headers()).entries()), // Convert ReadonlyHeaders to plain object
      }
    );

    return {
      products: docs,
      categories,
      pagination: { meta, links },
    };
  } catch (error: any) {
    throw new AppError(error.message, error.status);
  }
};

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
  try {
    const { products, categories, pagination } =
      await queryParams(searchParams);
    return (
      <div className="p-8 bg-gray-100 min-h-screen">
        <h1 className="text-3xl font-bold mb-6">
          {productsTranslate.products[lang].title}
        </h1>
        {/* <ProductTicket
      //products={products}
      /> */}
        <AdminProducts
          products={products}
          categories={categories}
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
      </div>
    );
  } catch (error: any) {
    return <ErrorHandler message={error.message} />;

    // throw new AppError(error.message, error.status);
  }
};
export default page;
