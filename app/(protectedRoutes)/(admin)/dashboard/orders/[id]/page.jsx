import api from "@/components/util/axios.api";
import AdminOrderDetails from "@/components/(admin)/dashboard/orders/OrderDetails";

const page = async ({ params }) => {
  const { id } = params;
  try {
    const {
      data: { data },
    } = await api.get(`/admin/dashboard/orders/${id}`);
    return <AdminOrderDetails order={data} />;
  } catch (error) {
    throw error;
  }
};

export default page;
