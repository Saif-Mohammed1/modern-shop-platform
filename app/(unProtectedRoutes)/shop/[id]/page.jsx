import ProductDetail from "@/components/products/product-details/productDetails";
import data from "../../../../data";
import api from "@/components/util/axios.api";

export const metadata = {
  title: "Shop - Product Details", // Update the title here
  description:
    "Explore the details of our wide range of products. Find the perfect item for your needs and make a purchase with confidence.", // Update the description here
};

const page = async ({ params }) => {
  const { id } = params;

  try {
    const { data } = await api.get("/shop/" + id);
    const product = data.data;
    return <ProductDetail product={product} />;
  } catch (error) {
    throw error;
  }
};

export default page;
