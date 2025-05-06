"use client";

import type { ProductType } from "@/app/lib/types/products.types";
import { lang } from "@/app/lib/utilities/lang";
import RelatedProducts from "@/components/ui/relatedProducts";
import { homePageTranslate } from "@/public/locales/client/(public)/homePageTranslate";


import Slider from "./slider/slider";

type HomeComponentProps = {
  productData: {
    topOfferProducts: ProductType[];
    newProducts: ProductType[];
    topRating: ProductType[];
  };
};

const HomeComponent = ({
  // topOfferProducts,
  // newProducts,
  // topRating,
  productData,
}: HomeComponentProps) => {
  const { topOfferProducts, newProducts, topRating } = productData;
  return (
    <section>
      <Slider />
      <RelatedProducts
        title={homePageTranslate[lang].discoverNewProducts.title}
        relatedProducts={newProducts}
        message={homePageTranslate[lang].discoverNewProducts.message}
        reverseDirection={true}
      />
      <RelatedProducts
        title={homePageTranslate[lang].checkOutTopRatedProducts.title}
        relatedProducts={topRating}
        message={homePageTranslate[lang].checkOutTopRatedProducts.message}
        delay={3500}
      />
      <RelatedProducts
        title={homePageTranslate[lang].exploreTopOfferProducts.title}
        relatedProducts={topOfferProducts}
        message={homePageTranslate[lang].exploreTopOfferProducts.message}
        delay={4000}
        reverseDirection={true}
        lastChid={true}
      />
    </section>
  );
};

export default HomeComponent;
