// import logger from "../logger/logs";
import { redis } from "./Redis";

const WINDOW_IN_SECONDS = 60; // 1 minute window
const MAX_REQUESTS = 30; // Maximum allowed requests per window
const KEY_PREFIX = "rate_limit:"; // Redis key prefix for better organization

// Lua script for atomic rate limiting operations
const RATE_LIMIT_SCRIPT = `
local key = KEYS[1]
local window = tonumber(ARGV[1])

local current = redis.call('INCR', key)
if current == 1 then
    redis.call('EXPIRE', key, window)
end
local ttl = redis.call('TTL', key)
return { current, ttl }
`;

export const rateLimiter = {
  limit: async (identifier: string) => {
    const key = `${KEY_PREFIX}${identifier}`;

    try {
      // Execute atomic Lua script
      const [currentRequests, ttl] = (await redis.eval(
        RATE_LIMIT_SCRIPT,
        [key], // KEYS array
        [WINDOW_IN_SECONDS.toString()] // ARGV array
      )) as [number, number];

      // Calculate remaining requests
      const remaining = Math.max(0, MAX_REQUESTS - currentRequests);

      // Prepare response
      const response = {
        success: true,
        allowed: true,
        limit: MAX_REQUESTS,
        remaining,
        reset: ttl,
        retryAfter: ttl,
        window: WINDOW_IN_SECONDS,
      };

      // Check if rate limit exceeded
      if (currentRequests > MAX_REQUESTS) {
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
      // Fail open strategy with full allowance
      return {
        success: true,
        allowed: true,
        limit: MAX_REQUESTS,
        remaining: MAX_REQUESTS,
        reset: WINDOW_IN_SECONDS,
        retryAfter: 0,
        window: WINDOW_IN_SECONDS,
      };
    }
  },
};
