import api from "@/components/util/axios.api";
import AdminOrderDetails from "@/components/(admin)/dashboard/orders/OrderDetails";
import AppError from "@/components/util/appError";
import ErrorHandler from "@/components/Error/errorHandler";

const page = async ({ params }) => {
  const { id } = params;
  try {
    const {
      data: { data },
    } = await api.get(`/admin/dashboard/orders/${id}`);
    return <AdminOrderDetails order={data} />;
  } catch (error) {
    return <ErrorHandler message={error.message} />;

    // throw new AppError(error.message, error.status);
  }
};

export default page;
