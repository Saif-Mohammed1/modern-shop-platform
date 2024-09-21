// pages/admin/products.js

import ErrorHandler from "@/components/Error/errorHandler";
import AdminProducts from "@/components/(admin)/dashboard/adminProduct";
import AppError from "@/components/util/appError";
import api from "@/components/util/axios.api";
import { headers } from "next/headers";
export const metadata = {
  title: "Products",
  description: "Products management for the admin",
  keywords: "admin, products, admin products",
};
const queryParams = async (searchParams) => {
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
      headers: headers(),
    });
    return { data, pageCount, categories };
  } catch (error) {
    throw new AppError(error.message, error.status);
  }
};

const page = async ({ searchParams }) => {
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
        <h1 className="text-3xl font-bold mb-6">Manage Products</h1>
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
  } catch (error) {
    return <ErrorHandler message={error.message} />;

    // throw new AppError(error.message, error.status);
  }
};
export default page;
