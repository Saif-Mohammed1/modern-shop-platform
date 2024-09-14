import EditProduct from "@/components/(admin)/dashboard/products/editProduct/editProduct";
import api from "@/components/util/axios.api";

const page = async ({ params }) => {
  const { id } = params;

  try {
    const {
      data: { data },
    } = await api.get(`/admin/dashboard/products/${id}`);
    return <EditProduct product={data} />;
  } catch (error) {
    return <div>{error.message}</div>;
  }
};

export default page;
