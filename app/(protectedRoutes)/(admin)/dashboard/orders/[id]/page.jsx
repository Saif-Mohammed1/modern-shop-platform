import api from "@/components/util/axios.api";
import AdminOrderDetails from "@/components/(admin)/dashboard/orders/OrderDetails";
import AppError from "@/components/util/appError";
import ErrorHandler from "@/components/Error/errorHandler";
import { headers } from "next/headers";
export const metadata = {
  title: "Order Details",
  description: "Order details for the admin",
  keywords: "admin, order, admin order",
};
const page = async ({ params }) => {
  const { id } = params;
  try {
    const {
      data: { data },
    } = await api.get(`/admin/dashboard/orders/${id}`, {
      headers: headers(),
    });
    return <AdminOrderDetails order={data} />;
  } catch (error) {
    return <ErrorHandler message={error.message} />;

    // throw new AppError(error.message, error.status);
  }
};

export default page;
