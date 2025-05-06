"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
  AiFillHeart,
  AiOutlineHeart,
  AiOutlineShoppingCart,
} from "react-icons/ai";
import { BsArrowLeftCircle, BsArrowRightCircle } from "react-icons/bs";
import StarRatings from "react-star-ratings";

import type { ProductType } from "@/app/lib/types/products.types";
// import type { ReviewsType } from "@/app/lib/types/reviews.types";
import api from "@/app/lib/utilities/api";
import { lang } from "@/app/lib/utilities/lang";
import { calculateDiscount } from "@/app/lib/utilities/priceUtils";
import ReviewSection from "@/components/products/Review/review";
import { addToCartItems } from "@/components/providers/store/cart/cart.store";
import { useUserStore } from "@/components/providers/store/user/user.store";
import {
  isInWishlist,
  toggleWishlist,
} from "@/components/providers/store/wishlist/wishlist.store";
import ComponentLoading from "@/components/spinner/componentLoading";
import Input from "@/components/ui/Input";
import RelatedProducts from "@/components/ui/relatedProducts";
import { shopPageTranslate } from "@/public/locales/client/(public)/shop/shoppageTranslate";

// import Skeleton from "react-loading-skeleton";
// import "react-loading-skeleton/dist/skeleton.css";

const ProductDetail = ({
  product,
  distribution,
  // reviews,
  // relatedProducts,
}: {
  product: ProductType;
  distribution: {
    [key: string]: number;
  };
  // relatedProducts: ProductType[];
  // reviews: {
  //   data: ReviewsType[];
  //   hasNextPage: boolean;
  // };
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState<ProductType[]>([]);
  const [quantity, setQuantity] = useState(1);

  const user = useUserStore((state) => state.user);

  const stock = product.stock - (product.reserved ?? 0);
  const { discountPercentage, discountedPrice, isDiscountValid } =
    calculateDiscount(product);

  const handleImageChange = (index: number) => {
    setCurrentImageIndex(index);
  };

  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(Math.max(1, Math.min(stock, newQuantity)));
  };
  // Toggle wishlist
  const toggleWishlistHandaler = async () => {
    let toastLoading;
    try {
      await toggleWishlist(product);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : shopPageTranslate[lang].functions.toggleWishlist.failed;
      toast.error(errorMessage);
    } finally {
      toast.dismiss(toastLoading);
    }
  }; // Handle add to cart
  const handleAddToCart = async () => {
    let toastLoading;
    if (stock === 0) {
      toast.error(shopPageTranslate[lang].functions.handleAddToCart.outOfStock);
      return;
    }

    try {
      toastLoading = toast.loading(
        shopPageTranslate[lang].functions.handleAddToCart.loading
      );
      await addToCartItems(product, quantity);
      toast.success(shopPageTranslate[lang].functions.handleAddToCart.success);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : shopPageTranslate[lang].functions.toggleWishlist.failed;

      toast.error(errorMessage);
    } finally {
      toast.dismiss(toastLoading);
    }
    // Add to cart logic here
  };

  useEffect(() => {
    const getrelatedProducts = async () => {
      try {
        const {
          data,
        }: {
          data: {
            products: {
              docs: ProductType[];
            };
          };
        } = await api.get(`/shop/?category=${product.category}&limit=8`);

        setRelatedProducts(data.products.docs);
      } catch (_error) {
        setRelatedProducts([]);
        // console.error(error);
      }
    };
    // Immediately invoke and handle promise properly
    void (async () => {
      try {
        await getrelatedProducts();
      } catch (error) {
        /* eslint-disable no-console */
        console.error("Error fetching related products:", error);
      }
    })();
  }, [product.category]);
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Gallery Section */}
        <div className="space-y-4">
          <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden">
            <Image
              src={
                product.images[currentImageIndex]?.link ||
                "/products/product.png"
              }
              alt={product.name}
              fill
              className="object-contain p-4"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />

            {product.images.length > 1 && (
              <div className="absolute top-1/2 transform -translate-y-1/2 w-full flex justify-between px-4">
                <button
                  onClick={() => {
                    handleImageChange(
                      (currentImageIndex - 1 + product.images.length) %
                        product.images.length
                    );
                  }}
                  className="bg-white/80 p-2 rounded-full shadow-lg hover:bg-white transition-colors"
                >
                  <BsArrowLeftCircle className="w-6 h-6" />
                </button>
                <button
                  onClick={() => {
                    handleImageChange(
                      (currentImageIndex + 1) % product.images.length
                    );
                  }}
                  className="bg-white/80 p-2 rounded-full shadow-lg hover:bg-white transition-colors"
                >
                  <BsArrowRightCircle className="w-6 h-6" />
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-4 gap-2">
            {product.images.map((image, index) => (
              <button
                key={index}
                onClick={() => {
                  handleImageChange(index);
                }}
                className={`aspect-square rounded-lg overflow-hidden border-2 ${
                  index === currentImageIndex
                    ? "border-blue-500"
                    : "border-transparent"
                }`}
              >
                <Image
                  src={image.link}
                  alt={`${product.name} thumbnail ${index + 1}`}
                  width={200}
                  height={200}
                  className="object-cover w-full h-full"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info Section */}
        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              <div className="flex items-center space-x-2">
                <StarRatings
                  rating={product.ratingsAverage}
                  starRatedColor="#f59e0b"
                  numberOfStars={5}
                  starDimension="20px"
                  starSpacing="2px"
                />
                <span className="text-gray-600">
                  ({product.ratingsQuantity}{" "}
                  {shopPageTranslate[lang].content.reviews})
                </span>
              </div>
            </div>
            {user ? (
              <button
                onClick={toggleWishlistHandaler}
                className="p-2 hover:bg-gray-100 rounded-full"
                aria-label={
                  isInWishlist(product._id)
                    ? "Remove from wishlist"
                    : "Add to wishlist"
                }
              >
                {isInWishlist(product._id) ? (
                  <AiFillHeart className="w-8 h-8 text-red-500" />
                ) : (
                  <AiOutlineHeart className="w-8 h-8 text-gray-400" />
                )}
              </button>
            ) : null}
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <span className="text-4xl font-bold text-gray-900">
                ${discountedPrice.toFixed(2)}
              </span>
              {isDiscountValid ? (
                <>
                  <span className="text-xl text-gray-500 line-through">
                    ${product.price.toFixed(2)}
                  </span>
                  <span className="bg-red-100 text-red-600 px-2 py-1 rounded">
                    -{discountPercentage}%
                  </span>
                </>
              ) : null}
            </div>

            <div className="flex items-center space-x-2">
              <span
                className={`text-sm font-medium ${stock > 0 ? "text-green-600" : "text-red-600"}`}
              >
                {stock > 0
                  ? `${shopPageTranslate[lang].content.inStock}`
                  : shopPageTranslate[lang].content.outOfStock}
              </span>
              <span className="text-gray-500 text-sm">
                {stock > 0 &&
                  `(${shopPageTranslate[lang].content.remaining}: ${stock})`}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center border rounded-lg">
                <button
                  onClick={() => {
                    handleQuantityChange(quantity - 1);
                  }}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <Input
                  type="number"
                  value={quantity}
                  min={1}
                  max={stock}
                  onChange={(e) => {
                    handleQuantityChange(parseInt(e.target.value));
                  }}
                  className="w-16 text-center border-0 focus:ring-0"
                />
                <button
                  onClick={() => {
                    handleQuantityChange(quantity + 1);
                  }}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  disabled={quantity >= stock}
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={stock === 0}
                className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors ${
                  stock === 0
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                <AiOutlineShoppingCart className="inline-block mr-2 w-5 h-5" />
                {stock > 0
                  ? shopPageTranslate[lang].content.addToCart
                  : shopPageTranslate[lang].content.outOfStock}
              </button>
            </div>

            {isDiscountValid ? (
              <div className="bg-yellow-50 p-3 rounded-lg">
                <p className="text-sm text-yellow-700">
                  {shopPageTranslate[lang].content.discountExpires}{" "}
                  {new Date(product.discountExpire || "").toLocaleDateString(
                    lang,
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                  {/* {formatDateTime(product.discountExpire)} */}
                </p>
              </div>
            ) : null}
          </div>

          {/* Product Specifications */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">
              {shopPageTranslate[lang].content.specifications}
            </h3>
            <dl className="grid grid-cols-2 gap-4">
              {product.attributes
                ? Object.entries(product.attributes).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <dt className="text-gray-600 capitalize">{key}</dt>
                      <dd className="text-gray-900 font-medium">{value}</dd>
                    </div>
                  ))
                : null}
              <div className="flex justify-between">
                <dt className="text-gray-600">
                  {shopPageTranslate[lang].content.category}
                </dt>
                <dd className="text-gray-900 font-medium capitalize">
                  {product.category}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
      {/* Product Description */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-4">
          {shopPageTranslate[lang].content.productDetails}
        </h2>
        <div className="prose max-w-none text-gray-700">
          {product.description.split("\n").map((paragraph, index) => (
            <p key={index} className="mb-4">
              {paragraph}
            </p>
          ))}
        </div>
      </section>
      {/* Reviews Section */}
      <section className="mt-12">
        <ReviewSection
          reviews={{
            data: product.reviews,
            hasNextPage: product.reviews.length === 5,
            distribution: distribution,
          }}
          productId={product._id}
          user={user}
          averageRating={product.ratingsAverage}
          totalReviews={product.ratingsQuantity}
        />
      </section>
      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-12">
          {/* <h2 className="text-2xl font-bold mb-6">
            {shopPageTranslate[lang].content.relatedProducts}
          </h2> */}
          <ComponentLoading>
            <RelatedProducts
              title={shopPageTranslate[lang].content.relatedProducts}
              relatedProducts={relatedProducts}
              // slidesPerView={{ default: 2, md: 3, lg: 4 }}
            />
          </ComponentLoading>
        </section>
      )}
    </div>
  );
};

export default ProductDetail;
