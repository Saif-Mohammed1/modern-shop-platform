import AdminOrdersDashboard from "@/components/(admin)/dashboard/orders/orderMangement";
import AppError from "@/components/util/appError";
import api from "@/components/util/axios.api";
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
      "/admin/dashboard/orders" + (queryString ? `?${queryString}` : "")
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
    throw new AppError(error.message, error.status);
  }
};

export default page;
