import { ordersTranslate } from "@/app/_translate/(auth)/(admin)/dashboard/ordersTranslate";
import AdminOrdersDashboard from "@/components/(admin)/dashboard/orders/orderMangement";
import ErrorHandler from "@/components/Error/errorHandler";
import AppError from "@/app/lib/util/appError";
import api from "@/app/lib/util/api";
import { lang } from "@/app/lib/util/lang";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { FC } from "react";
export const metadata: Metadata = {
  title: ordersTranslate.metadata[lang].title,
  description: ordersTranslate.metadata[lang].description,
  keywords: ordersTranslate.metadata[lang].keywords,
};
type SearchParams = {
  email?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  sort?: string;
  page?: string;
  limit?: string;
};
const queryParams = async (searchParams: SearchParams) => {
  const url = new URLSearchParams();

  // Append each parameter only if it's not undefined
  if (searchParams.email !== undefined) {
    url.append("email", searchParams.email);
  }
  if (searchParams.status !== undefined) {
    url.append("status", searchParams.status);
  }
  if (searchParams.startDate !== undefined) {
    url.append("startDate", searchParams.startDate);
  }
  if (searchParams.endDate !== undefined) {
    url.append("endDate", searchParams.endDate);
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
    // const {
    //   orders, pageCount
    // }
    const {
      data: { orders, pageCount },
    } = await api.get(
      "/admin/dashboard/orders" + (queryString ? `?${queryString}` : ""),
      {
        headers: Object.fromEntries(headers().entries()), // Convert ReadonlyHeaders to plain object
      }
    );

    return { orders, pageCount };
  } catch (error: any) {
    throw new AppError(error.message, error.status);
  }
};
type PageProps = {
  searchParams: SearchParams;
};
const page: FC<PageProps> = async ({ searchParams }) => {
  const defaultSearchParams = {
    email: searchParams.email || undefined,
    status: searchParams.status || undefined,
    startDate: searchParams.startDate || undefined,
    endDate: searchParams.endDate || undefined,
    sort: searchParams.sort || undefined,
    page: searchParams.page || undefined,
    limit: searchParams.limit || undefined,
  };

  try {
    const { orders, pageCount } = await queryParams(defaultSearchParams);
    return (
      <AdminOrdersDashboard initialOrders={orders} totalPages={pageCount} />
    );
  } catch (error: any) {
    return <ErrorHandler message={error.message} />;

    // throw new AppError(error.message, error.status);
  }
};

export default page;
