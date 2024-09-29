import { shopPageTranslate } from "@/app/_translate/shop/shoppageTranslate";
import ErrorHandler from "@/components/Error/errorHandler";
import ProductDetail from "@/components/products/product-details/productDetails";
// import AppError from "@/components/util/appError";
import api from "@/components/util/axios.api";
import { lang } from "@/components/util/lang";
import type { Metadata } from "next";
import { headers } from "next/headers";

// export const metadata = {
//   title: "Shop - Product Details", // Update the title here
//   description:
//     "Explore the details of our wide range of products. Find the perfect item for your needs and make a purchase with confidence.", // Update the description here
// };
type Props = {
  params: {
    id: string;
  };
};
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = params;

  try {
    const { data } = await api.get("/shop/" + id, {
      headers: Object.fromEntries(headers().entries()), // Convert ReadonlyHeaders to plain object
    });
    const product = data.data;
    return {
      title: shopPageTranslate[lang].metadata.title + " - " + product.name,
      description:
        shopPageTranslate[lang].metadata.description +
        " - " +
        product.description,
      keywords: shopPageTranslate[lang].metadata.keywords + ", " + product.name,
    };
  } catch (error) {
    return {
      title: shopPageTranslate[lang].metadata.title,
      description: shopPageTranslate[lang].metadata.description,
      keywords: shopPageTranslate[lang].metadata.keywords,
    };
  }
}
const page = async ({ params }: Props) => {
  const { id } = params;

  try {
    const { data } = await api.get("/shop/" + id, {
      headers: Object.fromEntries(headers().entries()), // Convert ReadonlyHeaders to plain object
    });
    const product = data.data;
    return <ProductDetail product={product} />;
  } catch (error: any) {
    return <ErrorHandler message={error.message} />;

    // throw new AppError(error.message, error.status);
  }
};

export default page;
