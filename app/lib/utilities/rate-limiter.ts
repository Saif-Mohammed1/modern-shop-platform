// import logger from "../logger/logs";
import { redis } from "./Redis";

// Different rate limits for different types of requests
const RATE_LIMITS = {
  // Strict limits for auth endpoints (login, register, etc.)
  auth: {
    window: 300, // 5 minutes
    maxRequests: 10, // 10 attempts per 5 minutes
  },
  // General API endpoints
  api: {
    window: 60, // 1 minute
    maxRequests: 30, // 30 requests per minute
  },
  // Very strict for critical operations
  critical: {
    window: 3600, // 1 hour
    maxRequests: 5, // 5 attempts per hour
  },
  // GraphQL specific (can be higher due to complexity)
  graphql: {
    window: 60, // 1 minute
    maxRequests: 20, // 20 queries per minute
  },
};

const KEY_PREFIX = "rate_limit:"; // Redis key prefix for better organization

// Lua script for atomic rate limiting operations
const RATE_LIMIT_SCRIPT = `
local key = KEYS[1]
local window = tonumber(ARGV[1])
local maxRequests = tonumber(ARGV[2])

local current = redis.call('INCR', key)
if current == 1 then
    redis.call('EXPIRE', key, window)
end
local ttl = redis.call('TTL', key)
return { current, ttl, maxRequests }
`;

export type RateLimitType = keyof typeof RATE_LIMITS;

export interface RateLimitResult {
  success: boolean;
  allowed: boolean;
  limit: number;
  remaining: number;
  reset: number;
  retryAfter: number;
  window: number;
  type: RateLimitType;
  error?: string;
}

export const rateLimiter = {
  limit: async (
    identifier: string,
    type: RateLimitType = "api"
  ): Promise<RateLimitResult> => {
    const config = RATE_LIMITS[type];
    const key = `${KEY_PREFIX}${type}:${identifier}`;

    try {
      // Execute atomic Lua script
      const [currentRequests, ttl, maxRequests] = (await redis.eval(
        RATE_LIMIT_SCRIPT,
        [key], // KEYS array
        [config.window.toString(), config.maxRequests.toString()] // ARGV array
      )) as [number, number, number];

      // Calculate remaining requests
      const remaining = Math.max(0, maxRequests - currentRequests);

      // Prepare response
      const response = {
        success: true,
        allowed: true,
        limit: maxRequests,
        remaining,
        reset: ttl,
        retryAfter: ttl,
        window: config.window,
        type,
      };

      // Check if rate limit exceeded
      if (currentRequests > maxRequests) {
        return {
          ...response,
          success: false,
          allowed: false,
          remaining: 0,
        };
      }

      return response;
    } catch (error) {
      /* eslint-disable no-console */
      console.error("Rate limiter error:", error);

      // ⚠️ FAIL-CLOSED STRATEGY: Deny requests when Redis is down
      // This prevents attacks but might affect legitimate users
      // Consider implementing a fallback mechanism in production
      return {
        success: false,
        allowed: false, // ✅ Fail closed for security
        limit: config.maxRequests,
        remaining: 0,
        reset: config.window,
        retryAfter: config.window,
        window: config.window,
        type,
        error: "Rate limiter temporarily unavailable",
      };
    }
  },

  // Method to check multiple rate limits at once
  checkMultiple: async (identifier: string, types: RateLimitType[]) => {
    const results = await Promise.all(
      types.map((type) => rateLimiter.limit(identifier, type))
    );

    // If any rate limit is exceeded, deny the request
    const blocked = results.find((result) => !result.allowed);
    if (blocked) {
      return blocked;
    }

    // Return the most restrictive result
    return results.reduce((most, current) =>
      current.remaining < most.remaining ? current : most
    );
  },

  // Reset rate limit for a specific identifier and type
  reset: async (identifier: string, type: RateLimitType) => {
    const key = `${KEY_PREFIX}${type}:${identifier}`;
    try {
      await redis.del(key);
      return { success: true };
    } catch (error) {
      console.error("Rate limiter reset error:", error);
      return { success: false, error };
    }
  },
};
