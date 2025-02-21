"use client";
import { useCartItems } from "@/components/providers/context/cart/cart.context";
import { useWishlist } from "@/components/providers/context/wishlist/wishlist.context";
import RelatedProducts from "@/components/ui/relatedProducts";
import ReviewSection from "@/components/products/Review/review";
import Image from "next/image";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai"; // Wishlist icons
import StarRatings from "react-star-ratings";
// import dynamic from "next/dynamic";
import { ProductType } from "@/app/lib/types/products.types";
import { shopPageTranslate } from "@/public/locales/client/(public)/shop/shoppageTranslate";
import { lang } from "@/app/lib/utilities/lang";
import { ReviewsType } from "@/app/lib/types/reviews.types";
import { useUser } from "@/components/providers/context/user/user.context";

const ProductDetail = ({
  product,
  reviews,
  relatedProducts,
}: {
  product: ProductType;
  relatedProducts: ProductType[];
  reviews: {
    data: ReviewsType[];
    hasNextPage: boolean;
  };
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  // const [relatedProducts, setRelatedProducts] = useState([]);
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  // const [reviews, setReviews] = useState([]);
  const { addToCartItems } = useCartItems();
  const [isWishlisted, setIsWishlisted] = useState(isInWishlist(product._id)); // Wishlist state
  const { user } = useUser();
  // Helper to change image
  const handleImageChange = (direction: string) => {
    if (direction === "next") {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === product.images.length - 1 ? 0 : prevIndex + 1
      );
    } else {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === 0 ? product.images.length - 1 : prevIndex - 1
      );
    }
  };

  // Handle add to cart
  const handleAddToCart = async () => {
    let toastLoading;
    if (product.stock === 0) {
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

  // Toggle wishlist
  const toggleWishlist = async () => {
    let toastLoading;
    try {
      if (isWishlisted) {
        toastLoading = toast.loading(
          shopPageTranslate[lang].functions.toggleWishlist.loadingRemoving
        );
        await removeFromWishlist(product);
        toast.success(shopPageTranslate[lang].functions.toggleWishlist.removed);
        setIsWishlisted(!isWishlisted);
      } else {
        toastLoading = toast.loading(
          shopPageTranslate[lang].functions.toggleWishlist.loadingAdding
        );
        await addToWishlist(product);

        toast.success(shopPageTranslate[lang].functions.toggleWishlist.success);
        setIsWishlisted(!isWishlisted);
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : shopPageTranslate[lang].functions.toggleWishlist.failed;
      toast.error(errorMessage);
    } finally {
      toast.dismiss(toastLoading);
    }
  };

  return product ? (
    <div className="product-detail max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-6">
      {/* Product Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-semibold">{product.name}</h2>
        {/* Wishlist Button */}
        <button
          className="text-red-500 text-2xl focus:outline-none"
          onClick={toggleWishlist}
        >
          {isWishlisted ? <AiFillHeart /> : <AiOutlineHeart />}
        </button>
      </div>
      {/* Category */}
      <p className="text-gray-500 mb-4 capitalize">{product.category}</p>
      {/* Image Preview */}
      <div className="relative w-full imgParent">
        <Image
          src={
            product?.images[currentImageIndex]?.link || "/products/product.png"
          }
          alt={product.name}
          // className="w-full h-full object-cover rounded-lg"
          width={700}
          height={700}
          priority
          style={{ objectFit: "cover" }}
        />
        {product?.images?.length > 1 && (
          <div className="absolute top-1/2 left-0 right-0 flex justify-between px-4 transform -translate-y-1/2">
            <button
              onClick={() => handleImageChange("prev")}
              className="bg-gray-800 text-white p-2 rounded-full hover:bg-gray-600 focus:outline-none"
            >
              {shopPageTranslate[lang].button.prev}
            </button>
            <button
              onClick={() => handleImageChange("next")}
              className="bg-gray-800 text-white p-2 rounded-full hover:bg-gray-600 focus:outline-none"
            >
              {shopPageTranslate[lang].button.next}
            </button>
          </div>
        )}
      </div>
      {/* Price and Discount */}
      <div className="mt-4 text-2xl">
        <span className="font-bold text-blue-600">
          $
          {parseFloat((product.price - product.discount).toString()).toFixed(2)}
        </span>
        {product.discount > 0 && (
          <span className="ml-3 text-gray-500 line-through text-xl">
            ${product.price}
          </span>
        )}
        {product.discount > 0 && (
          <p className="text-sm text-gray-500 mt-1">
            {shopPageTranslate[lang].content.expireOn}{" "}
            {product.discountExpire &&
              new Date(product.discountExpire).toLocaleDateString()}
          </p>
        )}
      </div>
      {/* Ratings */}
      <div className="flex items-center mt-4">
        <StarRatings
          rating={product.ratingsAverage}
          starRatedColor="#ffb829"
          numberOfStars={5}
          starDimension="20px"
          starSpacing="2px"
          name="rating"
        />
        <p className="ml-2 text-gray-600">
          {product.ratingsAverage} / 5 ({product.ratingsQuantity} reviews)
        </p>
      </div>
      {/* Stock and Add to Cart Button */}
      <div className="mt-6">
        <p
          className={`text-lg font-semibold ${
            product.stock > 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          {product.stock > 0
            ? `${shopPageTranslate[lang].content.inStock}(${product.stock})`
            : shopPageTranslate[lang].content.outOfStock}
        </p>
        <div className="flex items-center gap-2 my-1">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            -
          </button>
          <input
            type="number"
            min="1"
            max={product.stock}
            value={quantity}
            onChange={(e) => {
              const value = Math.min(
                product.stock,
                Math.max(1, parseInt(e.target.value) || 1)
              );
              setQuantity(value);
            }}
            className="w-16 text-center border rounded"
          />
          <button
            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            +
          </button>
        </div>{" "}
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className={`mt-4 px-6 py-2 text-lg font-semibold ${
            product.stock === 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          } text-white rounded-md transition duration-300 ease-in-out`}
        >
          {product.stock > 0
            ? shopPageTranslate[lang].content.addToCart
            : shopPageTranslate[lang].content.outOfStock}
        </button>
      </div>
      {/* Product Description */}
      <div className="mt-6">
        <h3 className="text-xl font-bold mb-2">
          {shopPageTranslate[lang].content.description}
        </h3>
        <p className="text-gray-700">{product.description}</p>
      </div>
      {/* Related Products */}
      <div>
        <RelatedProducts
          relatedProducts={relatedProducts}
          slidesPerView={true}
        />
      </div>
      {/* Reviews */}
      {/* <div>
        <ReviewSection reviews={reviews} productId={product._id} user={user} />
      </div> */}
    </div>
  ) : (
    <div className="flex  justify-center item-center space-x-2 h-full">
      <p className="text-lg text-gray-800">
        {shopPageTranslate[lang].errors.noProductFound}
      </p>
    </div>
  );
};

export default ProductDetail;
