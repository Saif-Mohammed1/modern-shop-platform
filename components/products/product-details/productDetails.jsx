"use client";
import { useCartItems } from "@/components/context/cart.context";
import { useUser } from "@/components/context/user.context";
import { useWishlist } from "@/components/context/whishList.context";
import RelatedProducts from "@/components/products/reuseableComponents/relatedProductsComponent";
import ReviewSection from "@/components/products/Review/review";
import api from "@/components/util/axios.api";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai"; // Wishlist icons
import StarRatings from "react-star-ratings";

const ProductDetailV2 = ({ product }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const [reviews, setReviews] = useState([]);
  const { addToCartItems } = useCartItems();
  const [isWishlisted, setIsWishlisted] = useState(isInWishlist(product._id)); // Wishlist state
  const { user } = useUser();
  // Helper to change image
  const handleImageChange = (direction) => {
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
      toast.error("This product is out of stock.");
      return;
    }

    try {
      toastLoading = toast.loading("Adding to cart");
      await addToCartItems(product);
      toast.success("Product added to cart.");
    } catch (error) {
      toast.error(error?.message || "Failed to add to cart");
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
        toastLoading = toast.loading("Removing from wishlist");
        await removeFromWishlist(product);
        toast.success("Removed from wishlist");
        setIsWishlisted(!isWishlisted);
      } else {
        toastLoading = toast.loading("Adding to wishlist");
        await addToWishlist(product);

        toast.success("Added to wishlist");
        setIsWishlisted(!isWishlisted);
      }
    } catch (error) {
      toast.error(error?.message || "Failed to add to wishlist");
    } finally {
      toast.dismiss(toastLoading);
    }
  };
  useEffect(() => {
    if (product && product.category) {
      const fetchRelatedProducts = async () => {
        try {
          const {
            data: { data },
          } = await api.get(`/shop?category=${product.category}`);

          setRelatedProducts(data);
        } catch (error) {
          setRelatedProducts([]);
        }
      };
      fetchRelatedProducts();
    }
  }, [product]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const {
          data: { data },
        } = await api.get(`/customer/reviews/${product._id}`);
        setReviews(data);
      } catch (error) {
        setReviews([]);
      }
    };
    fetchReviews();
  }, [product]);
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
          src={product.images[currentImageIndex] || "/products/product.png"}
          alt={product.name}
          className="w-full h-full object-cover rounded-lg"
          width={700}
          height={700}
          priority
          unoptimized
        />
        {product.images.length > 1 && (
          <div className="absolute top-1/2 left-0 right-0 flex justify-between px-4 transform -translate-y-1/2">
            <button
              onClick={() => handleImageChange("prev")}
              className="bg-gray-800 text-white p-2 rounded-full hover:bg-gray-600 focus:outline-none"
            >
              Prev
            </button>
            <button
              onClick={() => handleImageChange("next")}
              className="bg-gray-800 text-white p-2 rounded-full hover:bg-gray-600 focus:outline-none"
            >
              Next
            </button>
          </div>
        )}
      </div>
      {/* Price and Discount */}
      <div className="mt-4 text-2xl">
        <span className="font-bold text-blue-600">
          ${product.price - product.discount}
        </span>
        {product.discount > 0 && (
          <span className="ml-3 text-gray-500 line-through text-xl">
            ${product.price}
          </span>
        )}
        {product.discount > 0 && (
          <p className="text-sm text-gray-500 mt-1">
            Discount ends on:{" "}
            {new Date(product.discountExpire).toLocaleDateString()}
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
          {product.stock > 0 ? `In Stock (${product.stock})` : "Out of Stock"}
        </p>
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className={`mt-4 px-6 py-2 text-lg font-semibold ${
            product.stock === 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          } text-white rounded-md transition duration-300 ease-in-out`}
        >
          {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
        </button>
      </div>
      {/* Product Description */}
      <div className="mt-6">
        <h3 className="text-xl font-bold mb-2">Description</h3>
        <p className="text-gray-700">{product.description}</p>
      </div>
      <div>
        <RelatedProducts relatedProducts={relatedProducts} />
      </div>
      <div>
        <ReviewSection reviews={reviews} productId={product._id} user={user} />
      </div>
    </div>
  ) : (
    <div className="flex  justify-center item-center space-x-2 h-full">
      <p className="text-lg text-gray-800">There is no Product Found</p>
    </div>
  );
};

export default ProductDetailV2;
