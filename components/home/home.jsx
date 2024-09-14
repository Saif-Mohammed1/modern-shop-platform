"use client";
import Slider from "./slider/slider";
import RelatedProducts from "../products/reuseableComponents/relatedProductsComponent";
const HomeComponent = ({ topOfferProducts, newProducts, topRating }) => {
  return (
    <section>
      <Slider />
      <RelatedProducts
        title="Discover New Products"
        relatedProducts={newProducts}
        message="No items available at the moment. Check back later!"
        reverseDirection={true}
      />
      <RelatedProducts
        title="Check Out Top Rated Products"
        relatedProducts={topRating}
        message="No items available at the moment. Check back later!"
        delay={3500}
      />
      <RelatedProducts
        title="Explore Top Offer Products"
        relatedProducts={topOfferProducts}
        message="No items available at the moment. Check back later!"
        delay={4000}
        reverseDirection={true}
        lastChid={true}
      />
    </section>
  );
};

export default HomeComponent;
