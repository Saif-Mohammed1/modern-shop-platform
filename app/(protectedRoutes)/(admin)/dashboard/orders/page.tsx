import { ordersTranslate } from "@/app/_translate/(protectedRoute)/(admin)/dashboard/ordersTranslate";
import AdminOrdersDashboard from "@/components/(admin)/dashboard/orders/orderMangement";
import ErrorHandler from "@/components/Error/errorHandler";
import AppError from "@/components/util/appError";
import api from "@/components/util/axios.api";
import { lang } from "@/components/util/lang";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { FC } from "react";
export const metadata: Metadata = {
  title: ordersTranslate.metadata[lang].title,
  description: ordersTranslate.metadata[lang].description,
  keywords: ordersTranslate.metadata[lang].keywords,
};
type SearchParams = {
  user?: string;
  status?: string;
  date?: string;
  sort?: string;
  page?: string;
  limit?: string;
};
const queryParams = async (searchParams: SearchParams) => {
  const url = new URLSearchParams();

  // Append each parameter only if it's not undefined
  if (searchParams.user !== undefined) {
    // url.append("user", searchParams.user);
  }
  if (searchParams.status !== undefined) {
    url.append("status", searchParams.status);
  }
  if (searchParams.date !== undefined) {
    url.append("date", searchParams.date);
  }
  if (searchParams.sort !== undefined) {
    url.append("sort", searchParams.sort);
  }

  if (searchParams.page !== undefined) {
    url.append("page", searchParams.page);
  }
  if (searchParams.limit !== undefined) {
    url.append("limit", searchParams.limit);
  }

  const queryString = url.toString();
  try {
    const {
      data: { data, pageCount },
    } = await api.get(
      "/admin/dashboard/orders" + (queryString ? `?${queryString}` : ""),
      {
        headers: Object.fromEntries(headers().entries()), // Convert ReadonlyHeaders to plain object
      }
    );

    return { data, pageCount };
  } catch (error: any) {
    throw new AppError(error.message, error.status);
  }
};
type PageProps = {
  searchParams: SearchParams;
};
const page: FC<PageProps> = async ({ searchParams }) => {
  const defaultSearchParams = {
    user: searchParams.user || undefined,
    status: searchParams.status || undefined,
    date: searchParams.date || undefined,
    sort: searchParams.sort || undefined,
    page: searchParams.page || undefined,
    limit: searchParams.limit || undefined,
  };

  try {
    const { data, pageCount } = await queryParams(defaultSearchParams);

    return <AdminOrdersDashboard orders={data} totalPages={pageCount} />;
  } catch (error: any) {
    return <ErrorHandler message={error.message} />;

    // throw new AppError(error.message, error.status);
  }
};

export default page;
