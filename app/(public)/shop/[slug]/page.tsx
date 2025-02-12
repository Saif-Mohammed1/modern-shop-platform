import { shopPageTranslate } from "@/app/_translate/(public)/shop/shoppageTranslate";
import ErrorHandler from "@/components/Error/errorHandler";
import ProductDetail from "@/components/products/product-details/productDetails";
// import ComponentLoading from "@/components/spinner/componentLoading";//no need this we use next loading
// import AppError from "@/components/util/appError";
import api from "@/app/lib/util/api";
import { lang } from "@/app/lib/util/lang";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { cache } from "react";

type Props = {
  params: {
    slug: string;
  };
};
const getProductMetaData = cache(async (slug: string) => {
  const { data } = await api.get("/shop/" + slug + "/metadata", {
    headers: Object.fromEntries(headers().entries()), // Convert ReadonlyHeaders to plain object
  });
  return data.data;
});
const getProductData = cache(async (slug: string) => {
  const { data } = await api.get("/shop/" + slug, {
    headers: Object.fromEntries(headers().entries()), // Convert ReadonlyHeaders to plain object
  });
  return data.data;
});
// const getReviewsData = cache(async (slug: string) => {
//   const { data } = await api.get(`/customer/reviews/${slug}`, {
//     headers: Object.fromEntries(headers().entries()), // Convert ReadonlyHeaders to plain object
//   });
//   return data;
// });
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params;
  // api.get(`/customer/reviews/${product._slug}
  try {
    const product = await getProductMetaData(slug);

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
  const { slug } = params;

  try {
    const { product, relatedProducts, reviews } = await getProductData(slug);
    // const [product, reviews] = await Promise.all([
    //   // const { data } = await api.get("/shop/" + slug, {
    //   //   headers: Object.fromEntries(headers().entries()), // Convert ReadonlyHeaders to plain object
    //   // });
    //   getProductData(slug),
    //   // getReviewsData(slug),
    // ]);

    return (
      // <ComponentLoading>
      <ProductDetail
        product={product}
        reviews={reviews}
        relatedProducts={relatedProducts}
      />

      // </ComponentLoading>
    );
  } catch (error: any) {
    return <ErrorHandler message={error.message} />;

    // throw new AppError(error.message, error.status);
  }
};

export default page;
