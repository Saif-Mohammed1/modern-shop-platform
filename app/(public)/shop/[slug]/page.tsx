import { shopPageTranslate } from "@/public/locales/client/(public)/shop/shoppageTranslate";
import ErrorHandler from "@/components/Error/errorHandler";
import ProductDetail from "@/components/products/product-details/productDetails";
import api from "@/app/lib/utilities/api";
import { lang } from "@/app/lib/utilities/lang";
import type { Metadata } from "next";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};
const getProductMetaData = async (slug: string) => {
  const { data } = await api.get(
    "/shop/" + slug + "/metadata"
    //   {
    //   headers: Object.fromEntries(headers().entries()), // Convert ReadonlyHeaders to plain object
    // }
  );
  return data;
};
const getProductData = async (slug: string) => {
  // const { data } = await api.get(
  //   "/shop/" + slug
  //   //    {
  //   //   headers: Object.fromEntries(headers().entries()), // Convert ReadonlyHeaders to plain object
  //   // }
  // );
  const { data } = await api.get("/shop/" + slug);

  return data;
};
// const getReviewsData = (async (slug: string) => {
//   const { data } = await api.get(`/customers/reviews/${slug}`, {
//     headers: Object.fromEntries(headers().entries()), // Convert ReadonlyHeaders to plain object
//   });
//   return data;
// });
export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const { slug } = params;
  // api.get(`/customers/reviews/${product._slug}
  try {
    const { product } = await getProductMetaData(slug);

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
const page = async (props: Props) => {
  const params = await props.params;
  const { slug } = params;

  try {
    const { product, distribution } = await getProductData(slug);
    // const [product, reviews] = await Promise.all([
    //   // const { data } = await api.get("/shop/" + slug, {
    //   //   headers: Object.fromEntries(headers().entries()), // Convert ReadonlyHeaders to plain object
    //   // });
    //   getProductData(slug),
    //   // getReviewsData(slug),
    // ]);

    return (
      // <ComponentLoading>
      // </ComponentLoading>
      <ProductDetail
        product={product}
        distribution={distribution}
        // reviews={product.reviews}
        // relatedProducts={[]}
      />
    );
  } catch (error: any) {
    return <ErrorHandler message={error.message} />;

    // throw new AppError(error.message, error.status);
  }
};

export default page;
