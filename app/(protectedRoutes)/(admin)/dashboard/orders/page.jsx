import AdminOrdersDashboard from "@/components/(admin)/dashboard/orders/orderMangement";
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
    throw error;
  }
};

const page = async ({ searchParams }) => {
  try {
    const { data, pageCount } = await queryParams(searchParams);

    return <AdminOrdersDashboard orders={data} totalPages={pageCount} />;
  } catch (error) {
    throw error;
  }
};

export default page;
