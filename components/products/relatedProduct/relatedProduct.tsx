import Image from "next/image";
import Link from "next/link";
import StarRatings from "react-star-ratings";

import type { ProductType } from "@/app/lib/types/products.types";
import { lang } from "@/app/lib/utilities/lang";
import { calculateDiscount } from "@/app/lib/utilities/priceUtils";
import imageSrc from "@/app/lib/utilities/productImageHandler";
import { ProductTranslate } from "@/public/locales/client/(public)/ProductTranslate";

const RelatedProducts = ({
  relatedProducts,
}: {
  relatedProducts: ProductType[];
}) => {
  return (
    <div className="mt-8 mb-3 ">
      <h3 className="text-lg font-semibold mb-4">
        {ProductTranslate[lang].relatedProduct.title}
      </h3>
      <div className="flex overflow-x-auto no-scrollbar gap-6">
        {relatedProducts.length === 0 ? (
          <p className="text-gray-500">
            {ProductTranslate[lang].relatedProduct.noRelatedProducts}
          </p>
        ) : (
          relatedProducts.map((product) => {
            const { isDiscountValid, discountPercentage, discountedPrice } =
              calculateDiscount(product);
            return (
              <div
                key={product._id}
                className="card border p-4 hover:shadow-lg transition-shadow relative w-fit shadow-lg rounded bg-gray-200/70 /border-red-500 min-w-fit overflow-hidden"
              >
                {isDiscountValid ? (
                  <div className="absolute top-4 -left-9 text-center -rotate-45	 bg-red-500 text-white px-2 py-1 rounded-tl-md rounded-br-md shadow-md w-[149px]  ">
                    {discountPercentage.toFixed(0)}%{" "}
                    {ProductTranslate[lang].relatedProduct.off}
                  </div>
                ) : null}
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
                    {isDiscountValid ? (
                      <div>
                        <p className="text-sm font-light text-gray-600 line-through">
                          ${product.price}
                        </p>
                        <p className="text-sm font-light text-gray-600">
                          {
                            ProductTranslate[lang].relatedProduct
                              .discountedPrice
                          }
                          : ${discountedPrice.toFixed(2)}
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
            );
          })
        )}
      </div>
    </div>
  );
};

export default RelatedProducts;
