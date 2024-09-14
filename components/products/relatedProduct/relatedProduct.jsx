import imageSrc from "@/components/util/productImageHandler";
import { Rating } from "@mui/material";
import Image from "next/image";
import Link from "next/link";

const RelatedProducts = ({ relatedProducts }) => {
  return (
    <div className="mt-8 mb-3 ">
      <h3 className="text-lg font-semibold mb-4">Related Products</h3>
      <div className="flex overflow-x-auto no-scrollbar gap-6">
        {relatedProducts.length === 0 ? (
          <p className="text-gray-500">No related product exist</p>
        ) : (
          relatedProducts.map((product) => (
            <div
              key={product._id}
              className="card border p-4 hover:shadow-lg transition-shadow relative w-fit shadow-lg rounded bg-gray-200/70 /border-red-500 min-w-fit overflow-hidden"
            >
              {product.discount > 0 && (
                <div className="absolute top-4 -left-9 text-center -rotate-45	 bg-red-500 text-white px-2 py-1 rounded-tl-md rounded-br-md shadow-md w-[149px]  ">
                  {((product.discount / product.price) * 100).toFixed(0)}% OFF
                </div>
              )}
              <Link href={`/shop/${product._id}`}>
                <Image
                  src={imageSrc(product)}
                  alt={product.name}
                  width={150}
                  height={150}
                  style={{ objectFit: "cover" }}
                  className="mb-4"
                  priority
                />
                <div className="space-y-1">
                  <Rating
                    name="read-only"
                    value={product.ratingsAverage}
                    precision={0.5}
                    readOnly
                    size="small"
                  />
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
          ))
        )}
      </div>
    </div>
  );
};

export default RelatedProducts;
// import { Rating } from "@mui/material";
// import Image from "next/image";
// import Link from "next/link";

// const RelatedProducts = ({ relatedProducts }) => {
//   return (
//     <div className="mt-8 mb-3 ">
//       <h3 className="text-lg font-semibold mb-4">Related Products</h3>
//       <div className="flex overflow-x-auto no-scrollbar gap-6">
//         {relatedProducts.map((product) => (
//           <div
//             key={product._id}
//             className="card border p-4 hover:shadow-lg transition-shadow  w-fit shadow-lg rounded bg-gray-200/70 /border-red-500"
//           >
//             <Link
//               href={`/product/${product._id}`}
//               //   className=" border-4 border-red-500"
//               //  className="flex flex-col items-center text-center"
//             >
//               <Image
//                 src={
//                   product.images[0]
//                     ? product.images[0]
//                     : "/products/product.png"
//                 }
//                 alt={product.name}
//                 width={150}
//                 height={150}
//                       style={{objectFit:"cover"}}

//                 className="mb-4"
//               />
//               <div className="space-y-1">
//                 <Rating
//                   name="read-only"
//                   value={product.ratingsAverage}
//                   precision={0.5}
//                   readOnly
//                   size="small"
//                 />
//                 <h4 className="text-md font-medium">{product.name}</h4>
//                 <p className="text-sm font-light text-gray-600">
//                   ${product.price}
//                 </p>
//               </div>
//             </Link>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default RelatedProducts;
