"use client";

import { FaUser } from "react-icons/fa";
import { RiRobotFill } from "react-icons/ri";

import ProductCard from "./ProductCard";

interface Product {
  _id: string;
  slug: string;
  name: string;
  description?: string;
  price: number;
  discount?: number;
  discount_expire?: string;
  images?: { link: string }[];
}

interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
  products?: Product[];
  searchIntent?: string;
  confidence?: number;
}

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.type === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div
        className={`
        flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
        ${isUser ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600"}
      `}
      >
        {isUser ? (
          <FaUser className="w-4 h-4" />
        ) : (
          <RiRobotFill className="w-4 h-4" />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex-1 ${isUser ? "text-right" : "text-left"}`}>
        <div
          className={`
          inline-block px-4 py-2 rounded-2xl max-w-[85%] text-sm
          ${
            isUser
              ? "bg-blue-500 text-white rounded-br-md"
              : "bg-gray-100 text-gray-800 rounded-bl-md"
          }
        `}
        >
          {message.content}
        </div>

        {/* Products Grid */}
        {message.products && message.products.length > 0 ? (
          <div className="mt-3 space-y-2">
            {message.products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : null}

        {/* Metadata */}
        <div className="mt-1 text-xs text-gray-400">
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
          {message.confidence && message.confidence > 0.7 ? (
            <span className="ml-2">
              ✨ {Math.round(message.confidence * 100)}% confident
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
