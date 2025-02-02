import { shopPageTranslate } from "@/app/_translate/shop/shoppageTranslate";
import ErrorHandler from "@/components/Error/errorHandler";
import ProductDetail from "@/components/products/product-details/productDetails";
// import ComponentLoading from "@/components/spinner/componentLoading";//no need this we use next loading
// import AppError from "@/components/util/appError";
import api from "@/components/util/api";
import { lang } from "@/components/util/lang";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { cache } from "react";

type Props = {
  params: {
    id: string;
  };
};
const getProductData = cache(async (id: string) => {
  const { data } = await api.get("/shop/" + id, {
    headers: Object.fromEntries(headers().entries()), // Convert ReadonlyHeaders to plain object
  });
  return data.data;
});
const getReviewsData = cache(async (id: string) => {
  const { data } = await api.get(`/customer/reviews/${id}`, {
    headers: Object.fromEntries(headers().entries()), // Convert ReadonlyHeaders to plain object
  });
  return data;
});
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = params;
  // api.get(`/customer/reviews/${product._id}
  try {
    const product = await getProductData(id);

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
    const [product, reviews] = await Promise.all([
      // const { data } = await api.get("/shop/" + id, {
      //   headers: Object.fromEntries(headers().entries()), // Convert ReadonlyHeaders to plain object
      // });
      getProductData(id),
      getReviewsData(id),
    ]);

    return (
      // <ComponentLoading>
      <ProductDetail product={product} reviews={reviews} />
      // </ComponentLoading>
    );
  } catch (error: any) {
    return <ErrorHandler message={error.message} />;

    // throw new AppError(error.message, error.status);
  }
};

export default page;
