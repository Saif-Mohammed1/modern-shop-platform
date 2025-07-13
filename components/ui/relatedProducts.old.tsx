import Image from "next/image";
import Link from "next/link";
import StarRatings from "react-star-ratings";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import type { ProductType } from "@/app/lib/types/products.types";
import { cn } from "@/app/lib/utilities/cn";
import { lang } from "@/app/lib/utilities/lang";
import imageSrc from "@/app/lib/utilities/productImageHandler";
import { shopPageTranslate } from "@/public/locales/client/(public)/shop/shoppageTranslate";

import { DEFAULT_BREAKPOINTS, SWIPER_CONFIG } from "./config";
import "./styles.css";
// Utility function in separate file
const formatPrice = (value: number) =>
  new Intl.NumberFormat(lang, {
    style: "currency",
    currency: lang === "en" ? "USD" : "EUR",
    minimumFractionDigits: 2,
  }).format(value);
const DiscountBadge = ({
  discountPercentage,
}: {
  discountPercentage: string;
}) => (
  <div className="absolute top-3 -left-8 transform -rotate-45 bg-red-500 text-white px-8 py-1 text-xs font-bold shadow-lg">
    {discountPercentage}%{shopPageTranslate[lang].RelatedProducts.off}
  </div>
);

const StarRating = ({ rating }: { rating: number }) => (
  <StarRatings
    rating={rating}
    starRatedColor="#ffb829"
    numberOfStars={5}
    starDimension="16px"
    starSpacing="1px"
    name="rating"
    svgIconPath="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
    svgIconViewBox="0 0 24 24"
  />
);
const PriceDisplay = ({
  price,
  discount,
}: {
  price: number;
  discount?: number;
}) => (
  <div className="flex flex-col">
    {discount ? (
      <>
        <span className="text-xs text-muted-foreground line-through">
          {formatPrice(price)}
        </span>
        <span className="text-sm text-foreground font-medium">
          {shopPageTranslate[lang].RelatedProducts.discountedPrice}:
          {formatPrice(price - discount)}
        </span>
      </>
    ) : (
      <span className="text-sm text-foreground font-medium">
        {formatPrice(price)}
      </span>
    )}
  </div>
);

const ProductCard = ({ product }: { product: ProductType }) => {
  const discountPercentage = product.discount
    ? ((product.discount / product.price) * 100).toFixed(0)
    : 0;

  return (
    <article className="card group border p-4 hover:shadow-lg transition-all duration-300 shadow-md rounded-lg bg-background overflow-hidden w-[160px] md:w-[180px]">
      {product.discount > 0 && (
        <DiscountBadge discountPercentage={discountPercentage.toString()} />
      )}

      <Link
        href={`/shop/${product.slug}`}
        aria-label={`View ${product.name} details`}
        className="block"
      >
        <div className="relative aspect-square mb-4">
          <Image
            src={imageSrc(product)}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 160px, 180px"
            className="object-cover rounded-md"
            placeholder="blur"
            blurDataURL="/placeholder-product.jpg"
          />
        </div>

        <div className="space-y-2">
          <StarRating rating={product.ratings_average} />
          <h3 className="font-medium line-clamp-2 text-sm">{product.name}</h3>
          <PriceDisplay price={product.price} discount={product.discount} />
        </div>
      </Link>
    </article>
  );
};

type RelatedProductsProps = {
  title?: string;
  relatedProducts: ProductType[];
  message?: string;
  reverseDirection?: boolean;
  delay?: number;
  lastChild?: boolean;
  slidesPerView?: boolean;
  className?: string;
};

const RelatedProducts = ({
  title = shopPageTranslate[lang].RelatedProducts.title,
  relatedProducts,
  message = shopPageTranslate[lang].RelatedProducts.message,
  reverseDirection = false,
  delay = 3000,
  lastChild = false,
  slidesPerView,
  className,
}: RelatedProductsProps) => {
  const swiperConfig = slidesPerView
    ? SWIPER_CONFIG.slidesPerViewAuto
    : { breakpoints: DEFAULT_BREAKPOINTS };

  return (
    <section className={cn("mt-8", className, { "mb-6": lastChild })}>
      <h2 className="text-lg font-semibold mb-4 px-4">{title}</h2>

      {relatedProducts.length === 0 ? (
        <p className="text-gray-500 px-4">{message}</p>
      ) : (
        <div className="relative">
          <Swiper
            {...swiperConfig}
            navigation={true}
            autoplay={{ delay, reverseDirection }}
            modules={[Pagination, Autoplay, Navigation]}
            loop={true}
            className="px-4"
          >
            {relatedProducts.map((product) => (
              <SwiperSlide key={product._id} className="!w-auto">
                <ProductCard product={product} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}
    </section>
  );
};

export default RelatedProducts;
