/**
 * GraphQL-specific rate limiting middleware
 * Provides additional protection for GraphQL endpoints
 */

import type { NextRequest } from "next/server";

import { rateLimiter, type RateLimitType } from "./rate-limiter";

// GraphQL operation complexity analysis
const getOperationComplexity = (query: string): number => {
  // Simple complexity calculation based on query structure
  const depthMatches = query.match(/\{/g);
  const fieldMatches = query.match(/\w+\s*\(/g);

  return (depthMatches?.length || 0) + (fieldMatches?.length || 0);
};

// Get operation type from GraphQL query
const getOperationType = (
  query: string
): "query" | "mutation" | "subscription" => {
  if (query.includes("mutation")) {
    return "mutation";
  }
  if (query.includes("subscription")) {
    return "subscription";
  }
  return "query";
};

// Determine rate limit type based on GraphQL operation
const getGraphQLRateLimitType = (query: string): RateLimitType => {
  const operationType = getOperationType(query);

  // Mutations are more expensive, limit them more strictly
  if (operationType === "mutation") {
    // Check for auth-related mutations
    if (
      query.includes("login") ||
      query.includes("register") ||
      query.includes("password")
    ) {
      return "auth";
    }
    return "critical";
  }

  // High complexity queries get stricter limits
  const complexity = getOperationComplexity(query);
  if (complexity > 10) {
    return "critical";
  }

  return "graphql";
};

export const graphqlRateLimiter = {
  /**
   * Check rate limit for GraphQL operations
   */
  checkGraphQLRateLimit: async (req: NextRequest, query?: string) => {
    // Get client IP
    const clientIp =
      req.headers.get("x-client-ip") ||
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      "127.0.0.1";

    // If we have the query, analyze it for better rate limiting
    if (query) {
      const rateLimitType = getGraphQLRateLimitType(query);
      return await rateLimiter.limit(clientIp, rateLimitType);
    }

    // Default to GraphQL rate limit
    return await rateLimiter.limit(clientIp, "graphql");
  },

  /**
   * Check if query exceeds complexity limits
   */
  checkComplexity: (query: string, maxComplexity: number = 20): boolean => {
    const complexity = getOperationComplexity(query);
    return complexity <= maxComplexity;
  },

  /**
   * Analyze query for potential abuse patterns
   */
  analyzeQuery: (query: string) => {
    const analysis = {
      operationType: getOperationType(query),
      complexity: getOperationComplexity(query),
      hasIntrospection: query.includes("__schema") || query.includes("__type"),
      hasDeepNesting: (query.match(/\{/g)?.length || 0) > 5,
      fieldCount: query.match(/\w+\s*\(/g)?.length || 0,
      suspicious: false,
    };

    // Flag potentially abusive queries
    analysis.suspicious =
      analysis.hasDeepNesting ||
      analysis.complexity > 15 ||
      analysis.fieldCount > 20;

    return analysis;
  },
};
