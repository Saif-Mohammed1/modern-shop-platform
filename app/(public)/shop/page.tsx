import Shop from "@/components/shop/shop";
import api from "@/app/lib/utilities/api";
import AppError from "@/app/lib/utilities/appError";
import ErrorHandler from "@/components/Error/errorHandler";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { shopPageTranslate } from "@/public/locales/client/(public)/shop/shoppageTranslate";
import { lang } from "@/app/lib/utilities/lang";
// import ComponentLoading from "@/components/spinner/componentLoading";//no need this we use next loading

export const metadata: Metadata = {
  title: shopPageTranslate[lang].shopPage.Metadata.title,
  description: shopPageTranslate[lang].shopPage.Metadata.description,
  keywords: shopPageTranslate[lang].shopPage.Metadata.keywords,
};
type SearchParams = {
  category?: string;
  name?: string;
  sort?: string;
  fields?: string;
  page?: string;
  limit?: string;
  rating?: string;
  min?: string;
  max?: string;
};
const queryParams = async (searchParams: SearchParams) => {
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
      headers: Object.fromEntries(headers().entries()), // convert headers to object
    });
    return { data, pageCount, categories };
  } catch (error: any) {
    throw new AppError(error.message, error.status);
  }
};

const page = async ({ searchParams }: { searchParams: SearchParams }) => {
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
    const { data, categories, pageCount } =
      await queryParams(defaultSearchParams);
    // await new Promise<void>((resolve) => {
    //   setTimeout(() => {
    //     resolve();
    //   }, 12000); // Simulate a 12-second delay
    // });
    return (
      // <ComponentLoading>
      <Shop
        products={data || []}
        categories={categories || []}
        totalPages={pageCount || 1}
      />
      // </ComponentLoading>
    );
  } catch (error: any) {
    return <ErrorHandler message={error.message} />;

    // throw new AppError(error.message, error.status);
  }
};

export default page;
