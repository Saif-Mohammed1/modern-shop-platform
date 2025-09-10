"use client";

import Image from "next/image";
import Link from "next/link";
import { FaShoppingCart, FaExternalLinkAlt } from "react-icons/fa";

import { calculateDiscount } from "@/app/lib/utilities/priceUtils";

interface Product {
  _id: string;
  slug: string;
  name: string;
  description?: string;
  price: number;
  discount?: number;
  discount_expire?: string | Date;
  images?: { link: string }[];
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const {
    discountPercentage,
    discountedPrice,
    originalPrice,
    isDiscountValid,
  } = calculateDiscount(product);

  const imageUrl = product.images?.[0]?.link || "/placeholder-product.png";

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
      <div className="flex gap-3">
        {/* Product Image */}
        <div className="relative w-16 h-16 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder-product.png";
            }}
          />

          {/* Discount Badge */}
          {isDiscountValid ? (
            <div className="absolute top-1 right-1 bg-red-500 text-white text-xs px-1 py-0.5 rounded">
              -{discountPercentage}%
            </div>
          ) : null}
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm text-gray-900 truncate">
            {product.name}
          </h4>

          {product.description ? (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
              {product.description}
            </p>
          ) : null}

          {/* Price */}
          <div className="flex items-center gap-2 mt-2">
            <span className="font-semibold text-blue-600">
              ${discountedPrice.toFixed(2)}
            </span>

            {isDiscountValid ? (
              <span className="text-xs text-gray-400 line-through">
                ${originalPrice.toFixed(2)}
              </span>
            ) : null}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-2">
            <Link
              href={`/shop/products/${product.slug}`}
              className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600"
            >
              <FaExternalLinkAlt className="w-3 h-3" />
              View Details
            </Link>

            <button className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700">
              <FaShoppingCart className="w-3 h-3" />
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
