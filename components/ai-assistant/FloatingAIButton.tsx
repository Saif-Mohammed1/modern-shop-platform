"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { BsChatDots } from "react-icons/bs";
import { IoClose } from "react-icons/io5";

import AIChatDialog from "./AIChatDialog";

export default function FloatingAIButton() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Only show AI assistant on specific routes
  const allowedRoutes = [
    "/", // Home page
    "/shop", // Shop page and product pages (/shop/[slug])
  ];

  // Check if current route is allowed or is a product page
  const isAllowedRoute =
    allowedRoutes.includes(pathname) || pathname.startsWith("/shop/");

  // Don't render if not on allowed route
  if (!isAllowedRoute) {
    return null;
  }

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            relative group transition-all duration-300 ease-in-out transform
            ${isOpen ? "rotate-180 scale-110" : "hover:scale-110"}
            w-14 h-14 rounded-full shadow-lg
            bg-gradient-to-r from-blue-500 to-purple-600
            hover:from-blue-600 hover:to-purple-700
            flex items-center justify-center
            border-2 border-white/20
          `}
        >
          {isOpen ? (
            <IoClose className="w-6 h-6 text-white" />
          ) : (
            <BsChatDots className="w-6 h-6 text-white" />
          )}{" "}
          {/* Pulse animation when closed */}
          {!isOpen && (
            <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-75" />
          )}
          {/* Tooltip */}
          <div
            className="absolute right-16 top-1/2 transform -translate-y-1/2 
                         opacity-0 group-hover:opacity-100 transition-opacity duration-200
                         bg-gray-900 text-white text-sm px-3 py-2 rounded-lg
                         whitespace-nowrap shadow-lg"
          >
            AI Shopping Assistant
            <div
              className="absolute top-1/2 -right-1 transform -translate-y-1/2
                           border-l-4 border-l-gray-900 border-y-4 border-y-transparent"
            />
          </div>
        </button>
      </div>

      {/* AI Chat Dialog */}
      <AIChatDialog isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
