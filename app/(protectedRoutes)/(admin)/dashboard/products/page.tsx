// pages/admin/products.js

import ErrorHandler from "@/components/Error/errorHandler";
import AdminProducts from "@/components/(admin)/dashboard/adminProduct";
import AppError from "@/components/util/appError";
import api from "@/components/util/axios.api";
import { headers } from "next/headers";
import {
  ProductsSearchParams,
  productsTranslate,
} from "@/app/_translate/(protectedRoute)/(admin)/dashboard/productTranslate";
import { lang } from "@/components/util/lang";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: productsTranslate.metadata[lang].title,
  description: productsTranslate.metadata[lang].description,
  keywords: productsTranslate.metadata[lang].keywords,
};

type Props = {
  searchParams: { [key: string]: string | undefined };
};
const queryParams = async (searchParams: ProductsSearchParams) => {
  const url = new URLSearchParams();

  // Append each parameter only if it's not undefined
  if (searchParams.category !== undefined) {
    url.append("category", searchParams.category);
  }
  if (searchParams.name !== undefined) {
    url.append("name", searchParams.name);
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
        data,
        pageCount,
        categories: { categories },
      },
    } = await api.get("/shop/" + (queryString ? `?${queryString}` : ""), {
      headers: Object.fromEntries(headers().entries()), // Convert ReadonlyHeaders to plain object
    });
    return { data, pageCount, categories };
  } catch (error: any) {
    throw new AppError(error.message, error.status);
  }
};

const page = async ({ searchParams }: Props) => {
  const defaultSearchParams = {
    category: searchParams.category || undefined,
    name: searchParams.name || undefined,
    sort: searchParams.sort || undefined,
    fields: searchParams.fields || undefined,
    page: searchParams.page || undefined,
    limit: searchParams.limit || undefined,
    rating: searchParams.rating || undefined,
    min: searchParams.min || undefined,
    max: searchParams.max || undefined,
  };
  try {
    const { data, categories, pageCount } = await queryParams(
      defaultSearchParams
    );
    return (
      <div className="p-8 bg-gray-100 min-h-screen">
        <h1 className="text-3xl font-bold mb-6">
          {productsTranslate.products[lang].title}
        </h1>
        {/* <ProductTicket
      //products={products}
      /> */}
        <AdminProducts
          products={data}
          categories={categories}
          totalPages={pageCount}
        />
      </div>
    );
  } catch (error: any) {
    return <ErrorHandler message={error.message} />;

    // throw new AppError(error.message, error.status);
  }
};
export default page;
