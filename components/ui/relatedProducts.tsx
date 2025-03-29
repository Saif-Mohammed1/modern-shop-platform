import Image from "next/image";
import StarRatings from "react-star-ratings";
import type { ProductType } from "@/app/lib/types/products.types";
import { Swiper, SwiperSlide } from "swiper/react";
import "./styles.css";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import imageSrc from "@/app/lib/utilities/productImageHandler";
import { shopPageTranslate } from "@/public/locales/client/(public)/shop/shoppageTranslate";
import { lang } from "@/app/lib/utilities/lang";
import { v4 as uuidv4 } from "uuid";
import CustomLink from "./CustomLink";
// import { useEffect, useState } from "react";
type RelatedProductsProps = {
  title?: string;
  relatedProducts: ProductType[];
  message?: string;
  reverseDirection?: boolean;
  delay?: number;
  lastChid?: boolean;
  slidesPerView?: boolean;
};
const RelatedProducts = ({
  title = shopPageTranslate[lang].RelatedProducts.title,
  relatedProducts,
  message = shopPageTranslate[lang].RelatedProducts.message,
  reverseDirection = false,
  delay = 3000,
  lastChid = false,
  slidesPerView,
}: RelatedProductsProps) => {
  // const [relatedProducts, setRelatedProductsList] = useState<ProductType[]>(
  //   relatedProducts || []
  // );
  const swiperConfig = slidesPerView
    ? {
        slidesPerView: "auto" as const,
        spaceBetween: 30,
      }
    : {
        breakpoints: {
          0: {
            slidesPerView: 1,
            spaceBetween: 10,
          },
          640: {
            slidesPerView: 2,
            spaceBetween: 20,
          },
          768: {
            slidesPerView: 3,
            spaceBetween: 40,
          },
          1024: {
            slidesPerView: 5,
            spaceBetween: 50,
          },
          1280: {
            slidesPerView: 6,
            spaceBetween: 60,
          },
          1536: {
            slidesPerView: 7,
            spaceBetween: 70,
          },
        },
      };
  // useEffect(() => {
  //   setRelatedProductsList(relatedProducts);
  // }, [relatedProducts]);
  return (
    <div className={`mt-8 ${lastChid ? "mb-6" : " mb-3 "}`}>
      <h2 className="text-2xl font-bold mb-6">{title}</h2>

      {/* <h3 className="text-lg font-semibold mb-4">{title}</h3> */}
      {relatedProducts.length === 0 ? (
        <p className="text-gray-500">{message}</p>
      ) : (
        <Swiper
          navigation={true}
          // pagination={{ clickable: true }}
          // spaceBetween={30}
          autoplay={{
            delay,
            reverseDirection,
          }}
          modules={[Pagination, Autoplay, Navigation]}
          // slidesPerView={"auto"}
          loop={true}
          {...swiperConfig}
        >
          {relatedProducts.map((product) => (
            <SwiperSlide key={uuidv4()} style={{ width: "auto" }}>
              <div className="card  p-4 hover:shadow-lg transition-shadow relative /w-fit shadow-lg rounded bg-gray-200/70 min-w-[160px] overflow-hidden">
                {/* Discount Badge */}
                {product.discount > 0 && (
                  <div className="absolute top-4 -left-9 text-center -rotate-45 bg-red-500 text-white px-2 py-1 rounded-tl-md rounded-br-md shadow-md w-[149px]">
                    {((product.discount / product.price) * 100).toFixed(0)}%
                    {shopPageTranslate[lang].RelatedProducts.off}
                  </div>
                )}
                <CustomLink
                  href={`/shop/${product.slug}`}
                  className="hidden md:block"
                >
                  <div className="imgParent" style={{ height: "160px" }}>
                    <Image
                      src={imageSrc(product)}
                      alt={product.name}
                      width={100}
                      height={100}
                      style={{ objectFit: "cover" }}
                      className="mb-4"
                      priority
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="ratings">
                      <StarRatings
                        rating={product.ratingsAverage}
                        starRatedColor="#ffb829"
                        numberOfStars={5}
                        starDimension="20px"
                        starSpacing="2px"
                        name="rating"
                      />
                    </div>
                    <h4 className="text-md font-medium">{product.name}</h4>
                    {product.discount ? (
                      <div>
                        <p className="text-sm font-light text-gray-600 line-through">
                          ${parseFloat(product.price.toString()).toFixed(2)}
                        </p>
                        <p className="text-sm font-light text-gray-600">
                          {
                            shopPageTranslate[lang].RelatedProducts
                              .discountedPrice
                          }
                          : $
                          {parseFloat(
                            (product.price - product.discount).toString()
                          ).toFixed(2)}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm font-light text-gray-600">
                        ${product.price}
                      </p>
                    )}
                  </div>
                </CustomLink>
                <CustomLink
                  href={`/shop/${product.slug}`}
                  intercept={false}
                  className="block md:hidden"
                >
                  <div className="imgParent" style={{ height: "160px" }}>
                    <Image
                      src={imageSrc(product)}
                      alt={product.name}
                      width={100}
                      height={100}
                      style={{ objectFit: "cover" }}
                      className="mb-4"
                      priority
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="ratings">
                      <StarRatings
                        rating={product.ratingsAverage}
                        starRatedColor="#ffb829"
                        numberOfStars={5}
                        starDimension="20px"
                        starSpacing="2px"
                        name="rating"
                      />
                    </div>
                    <h4 className="text-md font-medium">{product.name}</h4>
                    {product.discount ? (
                      <div>
                        <p className="text-sm font-light text-gray-600 line-through">
                          ${parseFloat(product.price.toString()).toFixed(2)}
                        </p>
                        <p className="text-sm font-light text-gray-600">
                          {
                            shopPageTranslate[lang].RelatedProducts
                              .discountedPrice
                          }
                          : $
                          {parseFloat(
                            (product.price - product.discount).toString()
                          ).toFixed(2)}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm font-light text-gray-600">
                        ${product.price}
                      </p>
                    )}
                  </div>
                </CustomLink>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  );
};

export default RelatedProducts;
