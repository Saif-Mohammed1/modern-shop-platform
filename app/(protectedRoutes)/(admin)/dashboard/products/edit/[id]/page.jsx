import EditProduct from "@/components/(admin)/dashboard/products/editProduct/editProduct";
import api from "@/components/util/axios.api";
import { headers } from "next/headers";
// export const metadata = {
//   title: "Edit Product",
//   description: "Edit product for the admin",
//   keywords: "admin, edit product, admin edit product",
// };
export async function generateMetadata({ params }) {
  const { id } = params;

  try {
    const {
      data: { data: product },
    } = await api.get(`/admin/dashboard/products/${id}`, {
      headers: headers(),
    });

    return {
      title: `Edit Product - ${product.name}`,
      description: `Edit the product ${product.name}. ${product.description}`,
      keywords: `admin, edit product, ${product.name}, ${product.description}`,
    };
  } catch (error) {
    return {
      title: "Edit Product",
      description: "Edit product for the admin",
      keywords: "admin, edit product, admin edit product",
    };
  }
}
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
