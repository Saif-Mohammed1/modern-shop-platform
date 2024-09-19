import Shop from "@/components/shop/shop";
import api from "@/components/util/axios.api";
import AppError from "@/components/util/appError";
import ErrorHandler from "@/components/Error/errorHandler";
import { headers } from "next/headers";

export const metadata = {
  title: "Online Shop - Buy the Best Products",
  description:
    "Welcome to our online shop where you can find a wide range of high-quality products. Shop now and enjoy great deals and fast shipping!",
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
      <Shop
        products={data || []}
        categories={categories || []}
        totalPages={pageCount || 1}
      />
    );
  } catch (error) {
    return <ErrorHandler message={error.message} />;

    // throw new AppError(error.message, error.status);
  }
};

export default page;
