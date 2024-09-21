import ErrorHandler from "@/components/Error/errorHandler";
import ProductDetail from "@/components/products/product-details/productDetails";
import AppError from "@/components/util/appError";
import api from "@/components/util/axios.api";
import { headers } from "next/headers";

// export const metadata = {
//   title: "Shop - Product Details", // Update the title here
//   description:
//     "Explore the details of our wide range of products. Find the perfect item for your needs and make a purchase with confidence.", // Update the description here
// };
export async function generateMetadata({ params }) {
  const { id } = params;

  try {
    const { data } = await api.get("/shop/" + id, {
      headers: headers(),
    });
    const product = data.data;
    return {
      title: product.name,
      description: product.description,
      keywords: product.name,
    };
  } catch (error) {
    return {
      title: "Shop - Product Details",
      description:
        "Explore the details of our wide range of products. Find the perfect item for your needs and make a purchase with confidence.",
    };
  }
}
const page = async ({ params }) => {
  const { id } = params;

  try {
    const { data } = await api.get("/shop/" + id, {
      headers: headers(),
    });
    const product = data.data;
    return <ProductDetail product={product} />;
  } catch (error) {
    return <ErrorHandler message={error.message} />;

    // throw new AppError(error.message, error.status);
  }
};

export default page;
