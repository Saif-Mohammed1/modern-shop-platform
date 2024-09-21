import AdminOrdersDashboard from "@/components/(admin)/dashboard/orders/orderMangement";
import ErrorHandler from "@/components/Error/errorHandler";
import AppError from "@/components/util/appError";
import api from "@/components/util/axios.api";
import { headers } from "next/headers";
export const metadata = {
  title: "Orders",
  description: "Orders management for the admin",
  keywords: "admin, orders, admin orders",
};

const queryParams = async (searchParams) => {
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
        headers: headers(),
      }
    );

    return { data, pageCount };
  } catch (error) {
    throw new AppError(error.message, error.status);
  }
};

const page = async ({ searchParams }) => {
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
  } catch (error) {
    return <ErrorHandler message={error.message} />;

    // throw new AppError(error.message, error.status);
  }
};

export default page;
