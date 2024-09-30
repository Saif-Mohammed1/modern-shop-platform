"use client";
import { homePageTranslate } from "@/app/_translate/homePageTranslate";
import Slider from "./slider/slider";

import RelatedProducts from "@/components/products/reuseableComponents/relatedProductsComponent";
import { lang } from "../util/lang";
import { ProductType } from "@/app/_translate/(protectedRoute)/(admin)/dashboard/productTranslate";
type HomeComponentProps = {
  topOfferProducts: ProductType[];
  newProducts: ProductType[];
  topRating: ProductType[];
};
const HomeComponent = ({
  topOfferProducts,
  newProducts,
  topRating,
}: HomeComponentProps) => {
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
