"use client";

import { useQuery, gql } from "@apollo/client";
import { useState, useRef, useEffect } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { IoSend } from "react-icons/io5";
import { RiRobotFill } from "react-icons/ri";

import ChatMessageV2 from "./ChatMessageV2";

// Enhanced GraphQL Query for AI intelligent search
const INTELLIGENT_SEARCH = gql`
  query IntelligentSearch($query: String!) {
    intelligentSearch(query: $query) {
      response
      confidence
      timestamp
      suggestedProducts {
        _id
        slug
        name
        description
        price
        discount
        discount_expire
        stock
        category
        ratings_average
        ratings_quantity
      }
      insights {
        totalMatches
        priceAnalysis {
          min
          max
          average
          median
        }
        categories
        averageRating
        stockInsights {
          lowStock
          mediumStock
          highStock
          outOfStock
        }
        recommendations
      }
      debugLogs
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

interface IntelligentSearchData {
  intelligentSearch: {
    response: string;
    confidence: number;
    timestamp: string;
    suggestedProducts: Product[];
    insights: SearchInsights;
    debugLogs: string;
  };
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

interface AIChatDialogV2Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function AIChatDialogV2({
  isOpen,
  onClose,
}: AIChatDialogV2Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "ai",
      content:
        "🚀 Hello! I'm your enhanced AI shopping assistant powered by Google Gemini AI with real-time function calling. I can understand natural language queries like 'Find me a laptop under $1000 with good ratings' or 'Show me shirts on sale'. I'll analyze the results and provide detailed insights!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Apollo query for intelligent search - skip by default
  const { refetch: performIntelligentSearch } = useQuery<IntelligentSearchData>(
    INTELLIGENT_SEARCH,
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
      // Call intelligent search with enhanced AI
      const result = await performIntelligentSearch({ query: input });

      if (!result.data) {
        throw new Error("No data received from intelligent search");
      }

      const data = result.data.intelligentSearch;
      const products: Product[] = data.suggestedProducts || [];
      const { insights } = data;

      // Use the AI-generated response directly
      let aiResponse = data.response;

      // Add confidence indicator if high confidence
      if (data.confidence > 0.8) {
        aiResponse += ` (${Math.round(data.confidence * 100)}% confidence)`;
      }

      // Add insights summary
      if (insights && products.length > 0) {
        aiResponse += `\n\n📊 **Insights:**`;
        aiResponse += `\n• Found ${insights.totalMatches} products`;
        aiResponse += `\n• Price range: $${insights.priceAnalysis.min.toFixed(2)} - $${insights.priceAnalysis.max.toFixed(2)}`;
        aiResponse += `\n• Average price: $${insights.priceAnalysis.average.toFixed(2)}`;

        if (insights.averageRating > 0) {
          aiResponse += `\n• Average rating: ${insights.averageRating.toFixed(1)} stars`;
        }

        if (insights.categories.length > 0) {
          aiResponse += `\n• Categories: ${insights.categories.join(", ")}`;
        }

        if (insights.stockInsights.outOfStock > 0) {
          aiResponse += `\n⚠️ ${insights.stockInsights.outOfStock} items are out of stock`;
        }

        if (insights.recommendations.length > 0) {
          aiResponse += `\n\n💡 **Recommendations:**`;
          insights.recommendations.forEach((rec) => {
            aiResponse += `\n• ${rec}`;
          });
        }
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: aiResponse,
        timestamp: new Date(),
        products,
        insights,
        confidence: data.confidence,
        debugLogs: data.debugLogs,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: `Sorry, I encountered an error while searching: ${
          error instanceof Error ? error.message : "Unknown error"
        }. Please try again with a different query.`,
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

      {/* Chat Dialog - Enhanced Version */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-[480px] h-[700px] flex flex-col overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 flex items-center gap-3">
          <RiRobotFill className="w-6 h-6" />
          <div>
            <h3 className="font-semibold">Enhanced AI Assistant v2</h3>
            <p className="text-xs text-purple-100">
              Powered by Google Gemini AI with Function Calling
            </p>
          </div>
          <div className="ml-auto">
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
              Smart Search
            </span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <ChatMessageV2 key={message.id} message={message} />
          ))}

          {/* Loading indicator */}
          {isLoading ? (
            <div className="flex items-center gap-2 text-gray-500 p-3 bg-gray-50 rounded-lg">
              <RiRobotFill className="w-5 h-5 text-purple-500" />
              <AiOutlineLoading3Quarters className="w-4 h-4 animate-spin text-purple-500" />
              <span className="text-sm">AI is analyzing and searching...</span>
            </div>
          ) : null}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about products... (e.g., 'Find laptops under $1000 with good ratings')"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm placeholder-gray-500"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
              className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white px-4 py-3 rounded-xl transition-colors flex items-center gap-2"
            >
              <IoSend className="w-4 h-4" />
            </button>
          </div>

          {/* Enhanced quick suggestions */}
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              "Find laptops under $1000",
              "Show me shirts on sale",
              "Best rated products",
              "Electronics with good ratings",
              "Clothing under $200",
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setInput(suggestion)}
                className="text-xs bg-white hover:bg-purple-50 border border-purple-200 hover:border-purple-300 px-3 py-2 rounded-lg text-purple-700 transition-colors"
                disabled={isLoading}
              >
                {suggestion}
              </button>
            ))}
          </div>

          {/* Status indicator */}
          <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Enhanced AI with real-time function calling enabled</span>
          </div>
        </div>
      </div>
    </div>
  );
}
