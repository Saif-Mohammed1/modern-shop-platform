import Image from "next/image";
import Link from "next/link";
import StarRatings from "react-star-ratings";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./styles.css";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import imageSrc from "@/components/util/productImageHandler";

const RelatedProducts = ({
  title = "Related Products",
  relatedProducts,
  message = "No related product exists",
  reverseDirection = false,
  delay = 3000,
  lastChid = false,
}) => {
  return (
    <div className={`mt-8 ${lastChid ? "mb-6" : " mb-3 "}`}>
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      {relatedProducts.length === 0 ? (
        <p className="text-gray-500">{message}</p>
      ) : (
        <Swiper
          navigation={true}
          // pagination={{ clickable: true }}
          spaceBetween={30}
          autoplay={{
            delay,
            reverseDirection,
          }}
          modules={[Pagination, Autoplay, Navigation]}
          slidesPerView={"auto"}
        >
          {relatedProducts.map((product) => (
            <SwiperSlide key={product._id} style={{ width: "auto" }}>
              <div className="card border p-4 hover:shadow-lg transition-shadow relative /w-fit shadow-lg rounded bg-gray-200/70 min-w-[160px] overflow-hidden">
                {/* Discount Badge */}
                {product.discount > 0 && (
                  <div className="absolute top-4 -left-9 text-center -rotate-45 bg-red-500 text-white px-2 py-1 rounded-tl-md rounded-br-md shadow-md w-[149px]">
                    {((product.discount / product.price) * 100).toFixed(0)}% OFF
                  </div>
                )}
                <Link href={`/shop/${product._id}`}>
                  <Image
                    src={imageSrc(product)}
                    alt={product.name}
                    width={100}
                    height={100}
                    style={{ objectFit: "cover" }}
                    className="mb-4"
                    priority
                  />
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
                          ${product.price}
                        </p>
                        <p className="text-sm font-light text-gray-600">
                          Discounted Price: ${product.price - product.discount}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm font-light text-gray-600">
                        ${product.price}
                      </p>
                    )}
                  </div>
                </Link>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  );
};

export default RelatedProducts;
