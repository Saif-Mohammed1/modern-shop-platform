import {
  GoogleGenAI,
  FunctionCallingConfigMode,
  createPartFromFunctionResponse,
  type FunctionDeclaration,
  type FunctionCall,
} from "@google/genai";

import type { IProductViewBasicDB } from "@/app/lib/types/products.db.types";
import { calculateDiscount } from "@/app/lib/utilities/priceUtils";

import type { ProductService } from "../server/services/product.service";

// Updated interfaces to match GraphQL schema and database types
interface SearchInsights {
  totalMatches: number;
  priceAnalysis: {
    min: number;
    max: number;
    average: number;
    median: number;
  };
  categories: string[];
  averageRating: number;
  stockInsights: {
    lowStock: number;
    mediumStock: number;
    highStock: number;
    outOfStock: number;
  };
  recommendations: string[];
}

interface IntelligentSearchResponse {
  response: string;
  toolsUsed: string[];
  confidence: number;
  timestamp: string;
  suggestedProducts: IProductViewBasicDB[];
  insights: SearchInsights;
  debugLogs: string;
}

interface SearchProductsParams {
  query: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
}

interface AnalyzeSearchResultsParams {
  products: IProductViewBasicDB[];
  query: string;
}

export class EnhancedAIQueryParserService {
  private genAI: GoogleGenAI;
  private productService: ProductService;
  constructor(productService: ProductService) {
    const apiKey = process.env.GEMINI_API_KEY || "";
    this.genAI = new GoogleGenAI({ apiKey });
    this.productService = productService;
  }

  private functionDeclarations: FunctionDeclaration[] = [
    {
      name: "searchProducts",
      description: "Search for products based on query parameters",
      parametersJsonSchema: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search query for products" },
          minPrice: { type: "number", description: "Minimum price filter" },
          maxPrice: { type: "number", description: "Maximum price filter" },
          rating: {
            type: "number",
            description: "Minimum rating filter (1-5)",
          },
        },
        required: ["query"],
      },
    },
    {
      name: "analyzeSearchResults",
      description: "Analyze search results to provide insights",
      parametersJsonSchema: {
        type: "object",
        properties: {
          products: {
            type: "array",
            description: "Array of products to analyze",
          },
          query: { type: "string", description: "Original search query" },
        },
        required: ["products", "query"],
      },
    },
  ];

  private async executeToolCall(
    toolName: string,
    parameters: unknown
  ): Promise<unknown> {
    switch (toolName) {
      case "searchProducts": {
        const searchParams = new URLSearchParams();
        const params = parameters as SearchProductsParams;
        if (params.query) {
          searchParams.append("search", params.query);
        }
        if (params.minPrice) {
          searchParams.append("price[gte]", params.minPrice.toString());
        }
        if (params.maxPrice) {
          searchParams.append("price[lte]", params.maxPrice.toString());
        }
        if (params.rating) {
          searchParams.append("rating[gte]", params.rating.toString());
          searchParams.append("rating[lte]", "5");
        }

        const productsResult = await this.productService.getProducts({
          query: searchParams,
        });

        return {
          products: productsResult.docs,
          total: productsResult.meta.total,
          message: `Found ${productsResult.meta.total} products for: ${params.query}`,
        };
      }

      case "analyzeSearchResults": {
        const { products } = parameters as AnalyzeSearchResultsParams;

        // Calculate comprehensive insights
        const insights = this.calculateInsights(
          products,
          (parameters as AnalyzeSearchResultsParams).query
        );

        return {
          insights,
          summary: `Analyzed ${products.length} products with comprehensive insights`,
        };
      }

      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }

  private calculateInsights(
    products: IProductViewBasicDB[],
    _query: string
  ): SearchInsights {
    if (products.length === 0) {
      return {
        totalMatches: 0,
        priceAnalysis: { min: 0, max: 0, average: 0, median: 0 },
        categories: [],
        averageRating: 0,
        stockInsights: {
          lowStock: 0,
          mediumStock: 0,
          highStock: 0,
          outOfStock: 0,
        },
        recommendations: [],
      };
    }

    // Price analysis with proper discount calculations
    const priceCalculations = products.map((p) => calculateDiscount(p));
    const actualPrices = priceCalculations.map((calc) => calc.discountedPrice);

    const minPrice = Math.min(...actualPrices);
    const maxPrice = Math.max(...actualPrices);
    const averagePrice =
      actualPrices.reduce((sum, price) => sum + price, 0) / actualPrices.length;
    const sortedPrices = [...actualPrices].sort((a, b) => a - b);
    const medianPrice =
      sortedPrices.length % 2 === 0
        ? (sortedPrices[sortedPrices.length / 2 - 1] +
            sortedPrices[sortedPrices.length / 2]) /
          2
        : sortedPrices[Math.floor(sortedPrices.length / 2)];

    // Category analysis
    const categories = [...new Set(products.map((p) => p.category))];

    // Rating analysis
    const averageRating =
      products.reduce((sum, p) => sum + (p.ratings_average || 0), 0) /
      products.length;

    // Stock analysis
    const stockInsights = {
      lowStock: products.filter((p) => p.stock > 0 && p.stock <= 5).length,
      mediumStock: products.filter((p) => p.stock > 5 && p.stock <= 20).length,
      highStock: products.filter((p) => p.stock > 20).length,
      outOfStock: products.filter((p) => p.stock === 0).length,
    };

    // Generate recommendations with discount awareness
    const recommendations = [];
    const discountedProducts = priceCalculations.filter(
      (calc) => calc.isDiscountValid
    );

    if (stockInsights.outOfStock > 0) {
      recommendations.push(
        `${stockInsights.outOfStock} items are out of stock`
      );
    }
    if (averageRating > 4) {
      recommendations.push(
        "Found highly rated products with excellent reviews"
      );
    }
    if (discountedProducts.length > 0) {
      const avgDiscountPercent =
        discountedProducts.reduce(
          (sum, calc) => sum + calc.discountPercentage,
          0
        ) / discountedProducts.length;
      recommendations.push(
        `${discountedProducts.length} products on sale with average ${avgDiscountPercent.toFixed(0)}% discount`
      );
    }
    if (maxPrice - minPrice > 500) {
      recommendations.push(
        "Wide price range available to fit different budgets"
      );
    }

    return {
      totalMatches: products.length,
      priceAnalysis: {
        min: minPrice,
        max: maxPrice,
        average: averagePrice,
        median: medianPrice,
      },
      categories,
      averageRating,
      stockInsights,
      recommendations,
    };
  }

  async intelligentSearch(query: string): Promise<IntelligentSearchResponse> {
    const debugLogs: string[] = [];

    try {
      debugLogs.push(`Starting intelligent search for query: "${query}"`);

      const systemInstruction = `You are an intelligent product search assistant with advanced natural language processing capabilities. 

CORE TASKS:
1. Parse natural language queries to extract structured search parameters
2. Search for products with optimal filters internally
3. Analyze results to provide comprehensive insights
4. Generate helpful recommendations

NATURAL LANGUAGE EXAMPLES:
- "best laptop with good rating and price between 500 and 900" → search for laptops with price range and good ratings
- "cheap gaming computer under 800" → search for affordable gaming computers with maxPrice: 800
- "cheapest product" or "find me cheapest" → search with query: "" and maxPrice: 500 (empty query to see all products, then filter by price)
- "cheapest laptop" → search for "laptop" with maxPrice: 500
- "find me cheapest items" → search with query: "" and maxPrice: 300 (very budget-friendly)
- "top rated phones" → search for highly-rated phones with rating: 4
- "MacBook pro with good reviews" → search for MacBook Pro with good ratings
- "find me best shirt" → search for "shirt" with good ratings
- "affordable products under 200" → search with maxPrice: 200

PRICE PARSING RULES:
- "cheapest", "cheap", "affordable" without specific price → use maxPrice: 500
- "cheapest" + no specific product → use query: "" and maxPrice: 300 (to find cheapest across all products)
- "under X", "less than X", "below X" → use maxPrice: X
- "between X and Y" → use minPrice: X, maxPrice: Y
- "around X", "about X" → use minPrice: X-100, maxPrice: X+100

RESPONSE GUIDELINES:
- Always provide clear, conversational responses in plain text
- Focus on product insights and recommendations
- Don't mention internal system processes or tools
- Keep responses user-friendly and informative
- Always provide actionable suggestions when no results are found
- Respond only with natural language text, no structured data or code

Available search capabilities:
- Product search with price, rating, and category filters
- Comprehensive product analysis and insights

IMPORTANT: 
- Respond naturally without mentioning system internals or tool usage
- Always return plain text responses only - never return function calls or structured data
- When users ask for "cheapest" without price, search with maxPrice: 500
- For general "cheapest product" queries, use empty search with low price limit
- Focus on being helpful and conversational in all responses`;

      debugLogs.push(
        "Calling Google GenAI with enhanced natural language processing"
      );

      const response = await this.genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: query,
        config: {
          systemInstruction: systemInstruction,
          tools: [{ functionDeclarations: this.functionDeclarations }],
          toolConfig: {
            functionCallingConfig: {
              mode: FunctionCallingConfigMode.AUTO,
            },
          },
        },
      });

      debugLogs.push("Received response from Google GenAI");

      const { functionCalls } = response;
      const toolsUsed: string[] = [];
      let searchResults: IProductViewBasicDB[] = [];
      let analysisInsights: SearchInsights | null = null;

      if (functionCalls && functionCalls.length > 0) {
        debugLogs.push(`AI requested ${functionCalls.length} function calls`);

        const functionResponses = [];

        for (const functionCall of functionCalls) {
          const call = functionCall as FunctionCall;
          const callName = call.name;
          const callArgs = call.args;
          const callId = call.id;

          if (callName && callArgs) {
            debugLogs.push(
              `Executing tool: ${callName} with args: ${JSON.stringify(callArgs)}`
            );
            toolsUsed.push(callName);

            try {
              const result = await this.executeToolCall(callName, callArgs);

              if (callName === "searchProducts") {
                const searchResult = result as {
                  products?: IProductViewBasicDB[];
                };
                searchResults = searchResult.products || [];
                debugLogs.push(`Found ${searchResults.length} products`);
              } else if (callName === "analyzeSearchResults") {
                const analysisResult = result as { insights?: SearchInsights };
                analysisInsights = analysisResult.insights || null;
                debugLogs.push("Generated comprehensive insights");
              }

              functionResponses.push({
                role: "model",
                parts: [
                  createPartFromFunctionResponse(callId || "", callName, {
                    output: result,
                  }),
                ],
              });
            } catch (error) {
              debugLogs.push(`Error executing tool ${callName}: ${error}`);
              functionResponses.push({
                role: "model",
                parts: [
                  createPartFromFunctionResponse(callId || "", callName, {
                    error:
                      error instanceof Error ? error.message : String(error),
                  }),
                ],
              });
            }
          }
        }

        const followUpResponse = await this.genAI.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [
            { role: "user", parts: [{ text: query }] },
            ...functionResponses,
          ],
          config: {
            systemInstruction: systemInstruction,
          },
        });

        debugLogs.push("Generated final response with tool results");

        // Generate default insights if not provided by analysis
        const finalInsights =
          analysisInsights || this.calculateInsights(searchResults, query);

        // Extract text safely from response
        let responseText = "";
        try {
          responseText =
            followUpResponse.text || "Search completed successfully";
        } catch (_error) {
          debugLogs.push(
            "Warning: Response contains non-text parts, extracting text"
          );
          // Fallback: extract text from parts manually
          if (followUpResponse.candidates && followUpResponse.candidates[0]) {
            const candidate = followUpResponse.candidates[0];
            if (candidate.content && candidate.content.parts) {
              responseText =
                candidate.content.parts
                  .filter(
                    (part: unknown) =>
                      part && typeof part === "object" && "text" in part
                  )
                  .map((part: unknown) => (part as { text: string }).text)
                  .join(" ") || "Search completed successfully";
            }
          }
          if (!responseText) {
            responseText = `Found ${searchResults.length} products matching your search criteria.`;
          }
        }

        return {
          response: responseText,
          toolsUsed,
          confidence: 0.95,
          timestamp: new Date().toISOString(),
          suggestedProducts: searchResults,
          insights: finalInsights,
          debugLogs: debugLogs.join("\n"),
        };
      }

      debugLogs.push("AI did not request any function calls");

      // Extract text safely from initial response
      let responseText = "";
      try {
        responseText =
          response.text ||
          "I can help you search for products. Please provide more specific criteria.";
      } catch (_error) {
        debugLogs.push("Warning: Initial response contains non-text parts");
        responseText =
          "I can help you search for products. Please provide more specific criteria like product type, price range, or quality preferences.";
      }

      return {
        response: responseText,
        toolsUsed: [],
        confidence: 0.7,
        timestamp: new Date().toISOString(),
        suggestedProducts: [],
        insights: this.calculateInsights([], query),
        debugLogs: debugLogs.join("\n"),
      };
    } catch (error) {
      debugLogs.push(`Error in intelligent search: ${error}`);

      return {
        response: `Sorry, I encountered an error while searching: ${
          error instanceof Error ? error.message : String(error)
        }`,
        toolsUsed: [],
        confidence: 0.1,
        timestamp: new Date().toISOString(),
        suggestedProducts: [],
        insights: this.calculateInsights([], query),
        debugLogs: debugLogs.join("\n"),
      };
    }
  }
}
