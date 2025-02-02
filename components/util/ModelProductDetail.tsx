// "use client";
// import { ProductType } from "@/app/_translate/(protectedRoute)/(admin)/dashboard/productTranslate";
// import { shopPageTranslate } from "@/app/_translate/shop/shoppageTranslate";
// import { lang } from "@/components/util/lang";
// import Image from "next/image";
// import { useRouter } from "next/navigation";
// import { useState } from "react";
// import toast from "react-hot-toast";
// import { useCartItems } from "../context/cart.context";
// import { useWishlist } from "../context/whishList.context";

// const ModelProductDetail = ({ product }: { product: ProductType }) => {
//   const [currentImageIndex, setCurrentImageIndex] = useState(0);
//   const router = useRouter();
//   const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
//   // const [reviews, setReviews] = useState([]);
//   const { addToCartItems } = useCartItems();
//   const [isWishlisted, setIsWishlisted] = useState(isInWishlist(product._id)); // Wishlist state

//   // Handle add to cart
//   const handleAddToCart = async () => {
//     let toastLoading;
//     if (product.stock === 0) {
//       toast.error(shopPageTranslate[lang].functions.handleAddToCart.outOfStock);
//       return;
//     }

//     try {
//       toastLoading = toast.loading(
//         shopPageTranslate[lang].functions.handleAddToCart.loading
//       );
//       await addToCartItems(product);
//       toast.success(shopPageTranslate[lang].functions.handleAddToCart.success);
//     } catch (error: unknown) {
//       const errorMessage =
//         error instanceof Error
//           ? error.message
//           : shopPageTranslate[lang].functions.toggleWishlist.failed;

//       toast.error(errorMessage);
//     } finally {
//       toast.dismiss(toastLoading);
//     }
//     // Add to cart logic here
//   };

//   // Toggle wishlist
//   const toggleWishlist = async () => {
//     let toastLoading;
//     try {
//       if (isWishlisted) {
//         toastLoading = toast.loading(
//           shopPageTranslate[lang].functions.toggleWishlist.loadingRemoving
//         );
//         await removeFromWishlist(product);
//         toast.success(shopPageTranslate[lang].functions.toggleWishlist.removed);
//         setIsWishlisted(!isWishlisted);
//       } else {
//         toastLoading = toast.loading(
//           shopPageTranslate[lang].functions.toggleWishlist.loadingAdding
//         );
//         await addToWishlist(product);

//         toast.success(shopPageTranslate[lang].functions.toggleWishlist.success);
//         setIsWishlisted(!isWishlisted);
//       }
//     } catch (error: unknown) {
//       const errorMessage =
//         error instanceof Error
//           ? error.message
//           : shopPageTranslate[lang].functions.toggleWishlist.failed;
//       toast.error(errorMessage);
//     } finally {
//       toast.dismiss(toastLoading);
//     }
//   };
//   // Helper to change image
//   const handleImageChange = (direction: string) => {
//     if (direction === "next") {
//       setCurrentImageIndex((prevIndex) =>
//         prevIndex === product.images.length - 1 ? 0 : prevIndex + 1
//       );
//     } else {
//       setCurrentImageIndex((prevIndex) =>
//         prevIndex === 0 ? product.images.length - 1 : prevIndex - 1
//       );
//     }
//   };

//   const refreshPage = () => {
//     window.location.reload();
//     // router.refresh();
//   };

//   const goBack = () => {
//     // window.history.back();
//     router.back();
//   };

//   return (
//     <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl flex flex-col md:flex-row overflow-hidden relative ">
//       {/* Close Button */}
//       <button
//         onClick={goBack}
//         className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
//       >
//         ✖
//       </button>

//       {/* Product Images */}
//       <div className="w-full md:w-1/2 relative">
//         <div className="relative w-full h-96">
//           <Image
//             src={
//               product.images[currentImageIndex]?.link || "/products/product.png"
//             }
//             alt={product.name}
//             layout="fill"
//             objectFit="cover"
//             className="rounded-l-2xl"
//           />
//           {product.images.length > 1 && (
//             <div className="absolute inset-0 flex justify-between items-center px-4">
//               <button
//                 onClick={() => handleImageChange("prev")}
//                 className="bg-gray-800 text-white p-2 rounded-full hover:bg-gray-600 focus:outline-none"
//               >
//                 ◀
//               </button>
//               <button
//                 onClick={() => handleImageChange("next")}
//                 className="bg-gray-800 text-white p-2 rounded-full hover:bg-gray-600 focus:outline-none"
//               >
//                 ▶
//               </button>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Product Details */}
//       <div className="w-full md:w-1/2 p-6 space-y-4">
//         <h2 className="text-2xl font-bold">{product.name}</h2>
//         <p className="text-gray-600">{product.category}</p>
//         <div className="flex items-center space-x-2">
//           <p className="text-lg font-semibold">${product.price}</p>
//           {product.discount > 0 && (
//             <span className="text-sm text-green-600">
//               {((product.discount / product.price) * 100).toFixed(0)}% off
//             </span>
//           )}
//         </div>
//         <p className="text-sm text-gray-500">
//           Discount expires:{" "}
//           {product.discountExpire
//             ? new Date(product.discountExpire).toLocaleDateString()
//             : "N/A"}
//         </p>
//         <p className="text-gray-700">{product.description}</p>
//         <div className="flex justify-between items-center">
//           <button
//             onClick={refreshPage}
//             className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-lg hover:bg-blue-700"
//           >
//             Read More
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ModelProductDetail;
"use client";
import { ProductType } from "@/app/_translate/(protectedRoute)/(admin)/dashboard/productTranslate";
import { shopPageTranslate } from "@/app/_translate/shop/shoppageTranslate";
import { lang } from "@/components/util/lang";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useCartItems } from "../context/cart.context";
import { useWishlist } from "../context/whishList.context";
import StarRatings from "react-star-ratings";

// import { motion, AnimatePresence } from "framer-motion";

const ModelProductDetail = ({ product }: { product: ProductType }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const router = useRouter();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { addToCartItems } = useCartItems();
  const [isWishlisted, setIsWishlisted] = useState(false);
  // const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    setIsWishlisted(isInWishlist(product._id));
  }, [product._id, isInWishlist]);

  const handleAddToCart = async () => {
    if (product.stock === 0) {
      toast.error(shopPageTranslate[lang].functions.handleAddToCart.outOfStock);
      return;
    }

    const toastId = toast.loading(
      shopPageTranslate[lang].functions.handleAddToCart.loading
    );

    try {
      await addToCartItems(product);
      toast.success(shopPageTranslate[lang].functions.handleAddToCart.success, {
        id: toastId,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : shopPageTranslate[lang].functions.toggleWishlist.failed;
      toast.error(errorMessage, { id: toastId });
    }
  };

  const toggleWishlist = async () => {
    const toastId = toast.loading(
      isWishlisted
        ? shopPageTranslate[lang].functions.toggleWishlist.loadingRemoving
        : shopPageTranslate[lang].functions.toggleWishlist.loadingAdding
    );

    try {
      if (isWishlisted) {
        await removeFromWishlist(product);
        toast.success(
          shopPageTranslate[lang].functions.toggleWishlist.removed,
          { id: toastId }
        );
      } else {
        await addToWishlist(product);
        toast.success(
          shopPageTranslate[lang].functions.toggleWishlist.success,
          { id: toastId }
        );
      }
      setIsWishlisted(!isWishlisted);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : shopPageTranslate[lang].functions.toggleWishlist.failed;
      toast.error(errorMessage, { id: toastId });
    }
  };

  const handleImageNavigation = (index: number) => {
    setCurrentImageIndex(index);
  };

  return (
    // <AnimatePresence>
    //   <motion.div
    //     initial={{ opacity: 0, scale: 0.95 }}
    //     animate={{ opacity: 1, scale: 1 }}
    //     exit={{ opacity: 0, scale: 0.95 }}
    //     className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    //   >
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col md:flex-row overflow-hidden relative border-8 border-white">
      {/* Close Button */}
      <button
        onClick={() => router.back()}
        className="absolute top-4 right-4 z-50 p-2 bg-white/80 rounded-full backdrop-blur-sm hover:bg-gray-100 transition-colors"
        aria-label="Close"
      >
        ✕
      </button>

      {/* Product Images */}
      <div className="w-full md:w-1/2 relative group">
        {/* <div className="relative w-full aspect-square"> */}
        <div className="relative imgParent">
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
                onClick={() => handleImageNavigation(index)}
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
          {product.discount > 0 && (
            <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              {((product.discount / product.price) * 100).toFixed(0)}% OFF
            </div>
          )}
        </div>
      </div>

      {/* Product Details */}
      <div className="w-full md:w-1/2 p-6 flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {product.name}
          </h1>
          <div className="flex items-center gap-2 mb-4">
            <StarRatings
              rating={product.ratingsAverage}
              starRatedColor="#ffb829"
              numberOfStars={5}
              starDimension="20px"
              starSpacing="2px"
              name="rating"
            />{" "}
            <span className="text-sm text-gray-500">
              ({product.ratingsQuantity}{" "}
              {shopPageTranslate[lang].modelProductDetails.reviews})
            </span>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-primary">
              ${(product.price - product.discount).toFixed(2)}
            </span>
            {product.discount > 0 && (
              <span className="text-lg text-gray-400 line-through">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-gray-600">{product.description}</p>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>{shopPageTranslate[lang].modelProductDetails.category}:</span>
            <span className="font-medium">{product.category}</span>
          </div>
        </div>

        <div className="mt-auto flex gap-3">
          <button
            onClick={handleAddToCart}
            className="flex-1 bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
          >
            <span>🛒</span>
            {shopPageTranslate[lang].functions.handleAddToCart.loading}
          </button>
          <button
            onClick={toggleWishlist}
            className="p-3 rounded-lg border-2 transition-colors flex items-center justify-center hover:bg-red-50 hover:border-red-200 hover:text-red-600"
            aria-label={
              isWishlisted ? "Remove from wishlist" : "Add to wishlist"
            }
          >
            {isWishlisted ? "❤️" : "🤍"}
          </button>
        </div>

        {product.discountExpire && (
          <div className="text-sm text-gray-500 text-center">
            {shopPageTranslate[lang].modelProductDetails.Offer}{" "}
            {new Date(product.discountExpire).toLocaleDateString("en-US", {
              day: "numeric",
              month: "long",
            })}
          </div>
        )}
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-lg hover:bg-primary-dark transition-colors"
        >
          {shopPageTranslate[lang].modelProductDetails.getMoreDetails}
        </button>
      </div>
    </div>
    //   </motion.div>
    // </AnimatePresence>
  );
};

export default ModelProductDetail;
