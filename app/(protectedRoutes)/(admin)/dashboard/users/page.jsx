import AdminUsers from "@/components/(admin)/dashboard/users/users";
import api from "@/components/util/axios.api";
import AppError from "@/components/util/appError";

const queryParams = async (searchParams) => {
  const url = new URLSearchParams();

  // Append each parameter only if it's not undefined
  if (searchParams.email !== undefined) {
    url.append("email", searchParams.email);
  }
  if (searchParams.active !== undefined) {
    url.append("active", searchParams.active);
  }
  if (searchParams.sort !== undefined) {
    url.append("sort", searchParams.sort);
  }
  if (searchParams.role !== undefined) {
    url.append("role", searchParams.role);
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
      "/admin/dashboard/users" + (queryString ? `?${queryString}` : "")
    );

    return { data, pageCount };
  } catch (error) {
    throw new AppError(error.message, error.status);
  }
};

const page = async ({ searchParams }) => {
  const defaultSearchParams = {
    email: searchParams.email || undefined,
    active: searchParams.active || undefined,
    sort: searchParams.sort || undefined,
    role: searchParams.role || undefined,
    page: searchParams.page || undefined,
    limit: searchParams.limit || undefined,
  };

  try {
    const { data, pageCount } = await queryParams(defaultSearchParams);

    return <AdminUsers users={data} totalPages={pageCount} />;
  } catch (error) {
    throw new AppError(error.message, error.status);
  }
};

export default page;
