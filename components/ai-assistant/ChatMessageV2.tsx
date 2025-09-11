"use client";

import Link from "next/link";
import { AiOutlineStar, AiOutlineShoppingCart } from "react-icons/ai";
import { BiCategory } from "react-icons/bi";
import { BsGraphUp } from "react-icons/bs";
import { RiRobotFill, RiUser3Fill } from "react-icons/ri";

import { calculateDiscount } from "@/app/lib/utilities/priceUtils";
interface Product {
  _id: string;
  slug: string;
  name: string;
  description?: string;
  price: number;
  discount?: number;
  discount_expire?: string;
  stock: number;
  category: string;
  ratings_average: number;
  ratings_quantity: number;
}

interface PriceAnalysis {
  min: number;
  max: number;
  average: number;
  median: number;
}

interface StockInsights {
  lowStock: number;
  mediumStock: number;
  highStock: number;
  outOfStock: number;
}

interface SearchInsights {
  totalMatches: number;
  priceAnalysis: PriceAnalysis;
  categories: string[];
  averageRating: number;
  stockInsights: StockInsights;
  recommendations: string[];
}

interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
  products?: Product[];
  insights?: SearchInsights;
  confidence?: number;
  debugLogs?: string;
}

interface ChatMessageV2Props {
  message: Message;
}

export default function ChatMessageV2({ message }: ChatMessageV2Props) {
  const isUser = message.type === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser
            ? "bg-blue-500 text-white"
            : "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
        }`}
      >
        {isUser ? (
          <RiUser3Fill className="w-4 h-4" />
        ) : (
          <RiRobotFill className="w-4 h-4" />
        )}
      </div>

      {/* Message content */}
      <div className={`flex-1 ${isUser ? "text-right" : ""}`}>
        <div
          className={`inline-block p-3 rounded-2xl max-w-[90%] ${
            isUser
              ? "bg-blue-500 text-white rounded-br-md"
              : "bg-gray-100 text-gray-800 rounded-bl-md"
          }`}
        >
          {/* Message text with markdown-like formatting */}
          <div className="text-sm whitespace-pre-wrap">
            {message.content.split("\n").map((line, i) => {
              // Handle bold text
              if (line.includes("**")) {
                const parts = line.split("**");
                return (
                  <div key={i}>
                    {parts.map((part, j) =>
                      j % 2 === 1 ? (
                        <strong key={j} className="font-semibold">
                          {part}
                        </strong>
                      ) : (
                        <span key={j}>{part}</span>
                      )
                    )}
                  </div>
                );
              }
              // Handle bullet points
              if (line.startsWith("•")) {
                return (
                  <div key={i} className="ml-2 flex items-start gap-1">
                    <span className="text-purple-500 mt-1">•</span>
                    <span>{line.substring(1).trim()}</span>
                  </div>
                );
              }
              // Handle emoji headers (excluding tool indicators for security)
              if (
                line.startsWith("🚀") ||
                line.startsWith("📊") ||
                line.startsWith("💡") ||
                line.startsWith("⚠️")
              ) {
                return (
                  <div
                    key={i}
                    className="font-medium text-purple-700 mt-2 mb-1"
                  >
                    {line}
                  </div>
                );
              }
              // Filter out tool usage lines for security
              if (line.startsWith("🔧")) {
                return null;
              }
              return <div key={i}>{line}</div>;
            })}
          </div>
        </div>

        {/* Enhanced product display */}
        {message.products && message.products.length > 0 ? (
          <div className="mt-3 space-y-3">
            <div className="text-xs text-gray-500 font-medium">
              Found {message.products.length} product
              {message.products.length > 1 ? "s" : ""}:
            </div>
            <div className="grid gap-3">
              {message.products.slice(0, 3).map((product) => {
                const { discountPercentage, discountedPrice, isDiscountValid } =
                  calculateDiscount(product);
                return (
                  <Link
                    key={product._id}
                    href={`/shop/${product.slug}`}
                    className="block bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      {/* Product image placeholder */}
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <AiOutlineShoppingCart className="w-6 h-6 text-gray-400" />
                      </div>

                      {/* Product details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm truncate">
                          {product.name}
                        </h4>

                        {product.description ? (
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {product.description}
                          </p>
                        ) : null}

                        {/* Price and discount */}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="font-semibold text-purple-600">
                            ${discountedPrice.toFixed(2)}
                          </span>
                          {isDiscountValid ? (
                            <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                              -{discountPercentage.toFixed(0)}%
                            </span>
                          ) : null}
                        </div>

                        {/* Category, Rating, Stock */}
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <BiCategory className="w-3 h-3" />
                            <span>{product.category}</span>
                          </div>

                          {product.ratings_average > 0 ? (
                            <div className="flex items-center gap-1">
                              <AiOutlineStar className="w-3 h-3" />
                              <span>{product.ratings_average.toFixed(1)}</span>
                              {product.ratings_quantity > 0 ? (
                                <span>({product.ratings_quantity})</span>
                              ) : null}
                            </div>
                          ) : null}

                          <div
                            className={`flex items-center gap-1 ${
                              product.stock === 0
                                ? "text-red-500"
                                : product.stock <= 5
                                  ? "text-orange-500"
                                  : "text-green-500"
                            }`}
                          >
                            <span>Stock: {product.stock}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}

              {message.products.length > 3 ? (
                <div className="text-center">
                  <span className="text-xs text-gray-500">
                    and {message.products.length - 3} more products...
                  </span>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {/* Enhanced insights display */}
        {message.insights ? (
          <div className="mt-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <BsGraphUp className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">
                Search Analytics
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              {/* Price insights */}
              <div className="space-y-1">
                <div className="font-medium text-gray-700">Price Range</div>
                <div className="text-gray-600">
                  ${message.insights.priceAnalysis.min.toFixed(2)} - $
                  {message.insights.priceAnalysis.max.toFixed(2)}
                </div>
                <div className="text-gray-600">
                  Avg: ${message.insights.priceAnalysis.average.toFixed(2)}
                </div>
              </div>

              {/* Stock insights */}
              <div className="space-y-1">
                <div className="font-medium text-gray-700">Stock Status</div>
                <div className="space-y-1">
                  {message.insights.stockInsights.highStock > 0 ? (
                    <div className="text-green-600">
                      High: {message.insights.stockInsights.highStock}
                    </div>
                  ) : null}
                  {message.insights.stockInsights.lowStock > 0 ? (
                    <div className="text-orange-600">
                      Low: {message.insights.stockInsights.lowStock}
                    </div>
                  ) : null}
                  {message.insights.stockInsights.outOfStock > 0 ? (
                    <div className="text-red-600">
                      Out: {message.insights.stockInsights.outOfStock}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Categories */}
            {message.insights.categories.length > 0 ? (
              <div className="mt-3">
                <div className="text-xs font-medium text-gray-700 mb-1">
                  Categories
                </div>
                <div className="flex flex-wrap gap-1">
                  {message.insights.categories.slice(0, 4).map((category) => (
                    <span
                      key={category}
                      className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full"
                    >
                      {category}
                    </span>
                  ))}
                  {message.insights.categories.length > 4 ? (
                    <span className="text-xs text-gray-500">
                      +{message.insights.categories.length - 4} more
                    </span>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Confidence indicator only - tools hidden for security */}
        {message.confidence ? (
          <div className="mt-2 text-xs text-gray-500">
            <span className="text-green-600">
              ({Math.round(message.confidence * 100)}% confidence)
            </span>
          </div>
        ) : null}

        {/* Timestamp */}
        <div className="text-xs text-gray-400 mt-2">
          {message.timestamp.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}
