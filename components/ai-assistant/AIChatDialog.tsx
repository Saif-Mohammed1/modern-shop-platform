"use client";

import { useQuery, gql } from "@apollo/client";
import { useState, useRef, useEffect } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { IoSend } from "react-icons/io5";
import { RiRobotFill } from "react-icons/ri";

import ChatMessage from "./ChatMessage";

// GraphQL Query for AI search
const AI_SEARCH_PRODUCTS = gql`
  query AiSearchProducts($query: String!) {
    aiSearchProducts(query: $query) {
      products {
        docs {
          _id
          slug
          name
          description
          price
          discount
          discount_expire
          images {
            link
          }
        }
      }
      searchIntent
      confidence
    }
  }
`;

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

interface AISearchData {
  aiSearchProducts: {
    products: {
      docs: Product[];
    };
    searchIntent?: string;
    confidence?: number;
  };
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

interface AIChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AIChatDialog({ isOpen, onClose }: AIChatDialogProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "ai",
      content:
        "👋 Hello! I'm your AI shopping assistant. I can help you find products by describing what you're looking for. Try asking me something like 'Find me a nice shirt' or 'Show me products under $500'!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Apollo query for AI search - skip by default
  const { refetch: searchProducts } = useQuery<AISearchData>(
    AI_SEARCH_PRODUCTS,
    {
      variables: { query: "" },
      skip: true,
    }
  );

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle sending message
  const handleSendMessage = async () => {
    if (!input.trim()) {
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Call AI search
      const result = await searchProducts({ query: input });

      if (!result.data) {
        throw new Error("No data received from search");
      }

      const data = result.data.aiSearchProducts;
      let aiResponse = "";
      const products: Product[] = data?.products?.docs || [];

      // Generate AI response based on results
      if (products.length > 0) {
        aiResponse = `I found ${products.length} product${products.length > 1 ? "s" : ""} that match "${data?.searchIntent || input}". Here's what I discovered:`;

        if (data?.confidence && data.confidence > 0.8) {
          aiResponse += ` (I'm ${Math.round(data.confidence * 100)}% confident in this search)`;
        }
      } else {
        aiResponse = `I couldn't find any products matching "${input}". Try a different search term, or ask me to show you all products in a category like "shirts" or "electronics".`;
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: aiResponse,
        timestamp: new Date(),
        products,
        searchIntent: data?.searchIntent,
        confidence: data?.confidence,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (_error) {
      // Replace console.error with proper error handling
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content:
          "Sorry, I encountered an error while searching. Please try again with a different query.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSendMessage();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-end p-6">
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-black/20 backdrop-blur-sm border-none outline-none cursor-default"
        onClick={onClose}
        aria-label="Close dialog"
      />

      {/* Chat Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-96 h-[600px] flex flex-col overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 flex items-center gap-3">
          <RiRobotFill className="w-6 h-6" />
          <div>
            <h3 className="font-semibold">AI Shopping Assistant</h3>
            <p className="text-xs text-blue-100">Powered by Gemini AI</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}

          {/* Loading indicator */}
          {isLoading ? (
            <div className="flex items-center gap-2 text-gray-500">
              <RiRobotFill className="w-5 h-5" />
              <AiOutlineLoading3Quarters className="w-4 h-4 animate-spin" />
              <span className="text-sm">AI is thinking...</span>
            </div>
          ) : null}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about products..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white p-2 rounded-lg transition-colors"
            >
              <IoSend className="w-4 h-4" />
            </button>
          </div>

          {/* Quick suggestions */}
          <div className="mt-2 flex flex-wrap gap-1">
            {["Find shirts", "Under $500", "Best rated products"].map(
              (suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-gray-600 transition-colors"
                >
                  {suggestion}
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
