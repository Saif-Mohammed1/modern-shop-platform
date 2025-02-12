import imageSrc from "@/app/lib/util/productImageHandler";
import StarRatings from "react-star-ratings";

import Image from "next/image";
import Link from "next/link";
import { ProductType } from "@/app/lib/types/products.types";
const RelatedProducts = ({
  relatedProducts,
}: {
  relatedProducts: ProductType[];
}) => {
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
              <Link href={`/shop/${product.slug}`}>
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
                  <StarRatings
                    rating={product.ratingsAverage}
                    starRatedColor="#ffb829"
                    numberOfStars={5}
                    starDimension="20px"
                    starSpacing="2px"
                    name="rating"
                  />
                  <h4 className="text-md font-medium">{product.name}</h4>
                  {product.discount ? (
                    <div>
                      <p className="text-sm font-light text-gray-600 line-through">
                        ${product.price}
                      </p>
                      <p className="text-sm font-light text-gray-600">
                        Discounted Price: $
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
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RelatedProducts;
