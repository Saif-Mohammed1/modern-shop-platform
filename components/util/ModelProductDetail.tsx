// "use client";
// import { ProductType } from "@/app/_translate/(protectedRoute)/(admin)/dashboard/productTranslate";
// import { shopPageTranslate } from "@/app/_translate/shop/shoppageTranslate";
// import { lang } from "@/components/util/lang";
// import Image from "next/image";
// import { useState } from "react";
// /*export type ProductType = {
//   name: string;
//   category: string;
//   price: number;
//   discount: number;
//   discountExpire: Date | undefined;
//   images: OldImage[] | [];
//   user: Partial<UserType>;
//   description: string;
//   stock: number;
//   _id: string;
//   ratingsAverage: number;
//   ratingsQuantity: number;
//   createdAt: string;
// };
// */
// const ModelProductDetail = ({ product }: { product: ProductType }) => {
//   const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
//   return (
//     //  here it will quick recap for product data including only nucessary data not all data like _id name category price discount discountExpire images user description stock ratingsAverage ratingsQuantity createdAt with perfect structure and style in tailwindcss
//     <div className="flex p-4 gap-5">
//       <div className="product-details"></div>
//       <div className="product-imgs">
//         <div className="relative w-96 h-96">
//           <Image
//             src={product.images[0].link}
//             alt={product.name}
//             layout="fill"
//             objectFit="cover"
//           />
//           {product?.images?.length > 1 && (
//             <div className="absolute top-1/2 left-0 right-0 flex justify-between px-4 transform -translate-y-1/2">
//               <button
//                 onClick={() => handleImageChange("prev")}
//                 className="bg-gray-800 text-white p-2 rounded-full hover:bg-gray-600 focus:outline-none"
//               >
//                 {shopPageTranslate[lang].button.prev}
//               </button>
//               <button
//                 onClick={() => handleImageChange("next")}
//                 className="bg-gray-800 text-white p-2 rounded-full hover:bg-gray-600 focus:outline-none"
//               >
//                 {shopPageTranslate[lang].button.next}
//               </button>
//             </div>
//           )}
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
import { useState } from "react";

const ModelProductDetail = ({ product }: { product: ProductType }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const router = useRouter();

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

  const refreshPage = () => {
    // window.location.reload();
    router.refresh();
  };

  const goBack = () => {
    // window.history.back();
    router.back();
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl flex flex-col md:flex-row overflow-hidden relative bg-red">
      {/* Close Button */}
      <button
        onClick={goBack}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
      >
        ✖
      </button>

      {/* Product Images */}
      <div className="w-full md:w-1/2 relative">
        <div className="relative w-full h-96">
          <Image
            src={
              product.images[currentImageIndex]?.link || "/products/product.png"
            }
            alt={product.name}
            layout="fill"
            objectFit="cover"
            className="rounded-l-2xl"
          />
          {product.images.length > 1 && (
            <div className="absolute inset-0 flex justify-between items-center px-4">
              <button
                onClick={() => handleImageChange("prev")}
                className="bg-gray-800 text-white p-2 rounded-full hover:bg-gray-600 focus:outline-none"
              >
                ◀
              </button>
              <button
                onClick={() => handleImageChange("next")}
                className="bg-gray-800 text-white p-2 rounded-full hover:bg-gray-600 focus:outline-none"
              >
                ▶
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Product Details */}
      <div className="w-full md:w-1/2 p-6 space-y-4">
        <h2 className="text-2xl font-bold">{product.name}</h2>
        <p className="text-gray-600">{product.category}</p>
        <div className="flex items-center space-x-2">
          <p className="text-lg font-semibold">${product.price}</p>
          {product.discount > 0 && (
            <span className="text-sm text-green-600">
              {product.discount}% off
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500">
          Discount expires:{" "}
          {product.discountExpire
            ? new Date(product.discountExpire).toLocaleDateString()
            : "N/A"}
        </p>
        <p className="text-gray-700">{product.description}</p>
        <div className="flex justify-between items-center">
          <button
            onClick={refreshPage}
            className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-lg hover:bg-blue-700"
          >
            Read More
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModelProductDetail;
