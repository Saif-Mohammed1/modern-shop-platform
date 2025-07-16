"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { FaArrowRightLong } from "react-icons/fa6";
import StarRatings from "react-star-ratings";

import type { ProductType } from "@/app/lib/types/products.types";
import { lang } from "@/app/lib/utilities/lang";
import { calculateDiscount } from "@/app/lib/utilities/priceUtils";
import { useCartHook } from "@/components/providers/store/cart/useCartHook";
import { useToggleWishlist } from "@/components/providers/store/wishlist/useToggleWishlist";
import { isInWishlist } from "@/components/providers/store/wishlist/wishlist.store";
import { shopPageTranslate } from "@/public/locales/client/(public)/shop/shoppageTranslate";

import Input from "./Input";

// import { motion, AnimatePresence } from "framer-motion";

const ModelProductDetail = ({ product }: { product: ProductType }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const router = useRouter();
  const { addToCartItems } = useCartHook();
  const { toggleWishlist } = useToggleWishlist();

  // const [isWishlisted, setIsWishlisted] = useState(false);
  // const [isZoomed, setIsZoomed] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const stock = product.stock - (product.reserved || 0);
  // Modify the handleAddToCart function
  const handleAddToCart = async () => {
    if (stock === 0) {
      toast.error(shopPageTranslate[lang].functions.handleAddToCart.outOfStock);
      return;
    }

    const toastId = toast.loading(
      shopPageTranslate[lang].functions.handleAddToCart.loading
    );

    try {
      await addToCartItems(product, quantity);
      toast.success(shopPageTranslate[lang].functions.handleAddToCart.success, {
        id: toastId,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : shopPageTranslate[lang].functions.toggleWishlist.failed;
      toast.error(errorMessage, { id: toastId });
    } finally {
      toast.dismiss(toastId);
    }
  };

  const toggleWishlistHandler = async () => {
    const toastId = toast.loading(
      isInWishlist(product._id)
        ? shopPageTranslate[lang].functions.toggleWishlist.loadingRemoving
        : shopPageTranslate[lang].functions.toggleWishlist.loadingAdding
    );

    try {
      await toggleWishlist(product);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : shopPageTranslate[lang].functions.toggleWishlist.failed;
      toast.error(errorMessage, { id: toastId });
    } finally {
      toast.dismiss(toastId);
    }
  };

  const handleImageNavigation = (index: number) => {
    setCurrentImageIndex(index);
  };
  const { discountPercentage, discountedPrice, isDiscountValid } =
    calculateDiscount(product);
  return (
    // <AnimatePresence>
    //   <motion.div
    //     initial={{ opacity: 0, scale: 0.95 }}
    //     animate={{ opacity: 1, scale: 1 }}
    //     exit={{ opacity: 0, scale: 0.95 }}
    //     className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    //   >
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col md:flex-row overflow-hidden relative border-8 border-white">
      {/*    Close Button */}
      <button
        onClick={() => {
          router.back();
        }}
        className="absolute top-4 right-4 z-50 p-2 bg-white/80 rounded-full backdrop-blur-sm hover:bg-gray-100 transition-colors cursor-pointer"
        aria-label="Close"
      >
        ✕
      </button>

      {/* Product Images */}
      <div className="w-full md:w-1/2 relative group">
        {/* <div className="relative w-full aspect-square"> */}
        <div className="relative imgParent !h-40 md:!h-80 ">
          <Image
            src={
              product.images[currentImageIndex]?.link || "/products/product.png"
            }
            alt={product.name}
            fill
            className="object-cover "
            // onClick={() => setIsZoomed(!isZoomed)}
          />

          {/* Image Navigation Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {product.images.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  handleImageNavigation(index);
                }}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentImageIndex
                    ? "bg-primary"
                    : "bg-white/50 hover:bg-white/80"
                }`}
                aria-label={`View image ${index + 1}`}
              />
            ))}
          </div>

          {/* Discount Badge */}
          {isDiscountValid ? (
            <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              {discountPercentage.toFixed(0)}%
              {shopPageTranslate[lang].RelatedProducts.off}
            </div>
          ) : null}
        </div>
      </div>

      {/* Product Details */}
      <div className="w-full md:w-1/2 p-1 md:p-6 flex flex-col gap-1 md:gap-4">
        <div>
          <h1 className="text-xl md:text-2xl  font-bold text-gray-900 mb-1 md:mb-2">
            {product.name}
          </h1>
          <div className="flex items-center gap-2 mb-1 md:mb-4">
            <StarRatings
              rating={product.ratings_average}
              starRatedColor="#ffb829"
              numberOfStars={5}
              starDimension="20px"
              starSpacing="2px"
              name="rating"
            />{" "}
            <span className="text-sm text-gray-500">
              ({product.ratings_quantity}{" "}
              {shopPageTranslate[lang].modelProductDetails.reviews})
            </span>
          </div>
          <div className="flex items-baseline gap-1 md:gap-3">
            <span className="text-xl md:text-3xl font-bold text-primary">
              ${discountedPrice.toFixed(2)}
            </span>
            {isDiscountValid ? (
              <span className="text-lg text-gray-400 line-through">
                ${product.price.toFixed(2)}
              </span>
            ) : null}
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-gray-600">{product.description}</p>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>{shopPageTranslate[lang].modelProductDetails.category}:</span>
            <span className="font-medium">{product.category}</span>
          </div>
        </div>
        {/* // Add the quantity input component before the Add to Cart button */}
        <div className="flex items-center gap-2 md:gap-4 mb-2 md:mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setQuantity(Math.max(1, quantity - 1));
              }}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 cursor-pointer"
            >
              -
            </button>
            <Input
              type="number"
              min="1"
              max={stock}
              value={quantity}
              onChange={(e) => {
                const value = Math.min(
                  stock,
                  Math.max(1, parseInt(e.target.value) || 1)
                );
                setQuantity(value);
              }}
              className="w-16 text-center border-gray-50 rounded"
            />
            <button
              onClick={() => {
                setQuantity(Math.min(stock, quantity + 1));
              }}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 cursor-pointer"
            >
              +
            </button>
          </div>
          <span className="text-sm text-gray-500">
            {stock} {shopPageTranslate[lang].modelProductDetails.inStock}
          </span>
        </div>
        <div
          className="mt-auto flex gap-3 justify-between
        "
        >
          <button
            onClick={handleAddToCart}
            // className="flex-1 bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
            className="p-3 rounded-lg hover:border-2 transition-colors flex items-center justify-center hover:bg-red-50 hover:border-blue-200 hover:text-blue-600 cursor-pointer"
            aria-label="Add to cart"
          >
            <p className="text-xl flex gap-2">
              {/* 
              make animation to move right and back 
               */}
              {/* <span className="mx-1 "> */}
              {/* {shopPageTranslate[lang].modelProductDetails.confirm} */}
              <FaArrowRightLong className="animate-bounce mt-1" />
              🛒
              {/* </span> */}
            </p>
          </button>
          <button
            onClick={toggleWishlistHandler}
            className="p-3 rounded-lg hover:border-2 transition-colors flex items-center justify-center hover:bg-red-50 hover:border-red-200 hover:text-red-600 cursor-pointer"
            aria-label={
              isInWishlist(product._id)
                ? "Remove from wishlist"
                : "Add to wishlist"
            }
          >
            <span className="text-xl">
              {isInWishlist(product._id) ? "❤️" : "🤍"}
            </span>
          </button>
        </div>
        {product.discount_expire ? (
          <div className="text-sm text-gray-500 text-center">
            {shopPageTranslate[lang].modelProductDetails.Offer}{" "}
            {new Date(product.discount_expire).toLocaleDateString(lang, {
              day: "numeric",
              month: "long",
            })}
          </div>
        ) : null}

        <button
          onClick={() => {
            window.location.reload();
          }}
          // href={`/shop/${product.slug}`}
          // intercept={false}
          className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-lg hover:bg-primary-dark transition-colors cursor-pointer"
        >
          {shopPageTranslate[lang].modelProductDetails.getMoreDetails}
        </button>
        {/* 
        <CustomLink
          href={`/shop/${product.slug}`}
          intercept={false}
          className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-lg hover:bg-primary-dark transition-colors cursor-pointer"
        >
          {shopPageTranslate[lang].modelProductDetails.getMoreDetails}
        </CustomLink> */}
      </div>
    </div>
    // </div>
    //   </motion.div>
    // </AnimatePresence>
  );
};

export default ModelProductDetail;
