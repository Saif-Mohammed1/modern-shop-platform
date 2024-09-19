import EditProduct from "@/components/(admin)/dashboard/products/editProduct/editProduct";
import api from "@/components/util/axios.api";
import { headers } from "next/headers";

const page = async ({ params }) => {
  const { id } = params;

  try {
    const {
      data: { data },
    } = await api.get(`/admin/dashboard/products/${id}`, {
      headers: headers(),
    });
    return <EditProduct product={data} />;
  } catch (error) {
    return <div>{error.message}</div>;
  }
};

export default page;
