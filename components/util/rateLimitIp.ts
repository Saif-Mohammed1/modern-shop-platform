// Rate limiting configuration
// const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
// const MAX_REQUESTS_PER_WINDOW = 5; // 100 requests

// // In-memory store for IP requests
// const ipRequestStore: { [key: string]: { count: number; startTime: number } } =
//   {};

// // Rate limiting middleware function
// export function rateLimitIp(ip: string) {
//   const currentTime = Date.now();
//   const requestInfo = ipRequestStore[ip] || {
//     count: 0,
//     startTime: currentTime,
//   };

//   if (currentTime - requestInfo.startTime > RATE_LIMIT_WINDOW_MS) {
//     // Reset the count and startTime if the window has passed
//     requestInfo.count = 1;
//     requestInfo.startTime = currentTime;
//   } else {
//     // Increment the count if within the window
//     requestInfo.count += 1;
//   }

//   ipRequestStore[ip] = requestInfo;

//   if (requestInfo.count > MAX_REQUESTS_PER_WINDOW) {
//     // Return a 429 status code if the limit is exceeded

//     return {
//       failed: true,
//     };
//   }
//   return {
//     failed: false,
//   };
// }

// middleware/rateLimiter.ts
const rateLimitMap = new Map(); // In-memory store

export const rateLimitIp = (ip: string) => {
  const limit = 15; // Max requests per window (for example, 10 requests)
  const windowMs = 60 * 1000; // 1 minute window

  const now = Date.now();
  const entry = rateLimitMap.get(ip) || { count: 0, startTime: now };

  if (now - entry.startTime > windowMs) {
    // Reset window if it expired
    rateLimitMap.set(ip, { count: 1, startTime: now });
  } else {
    if (entry.count >= limit) {
      // Too many requests - send error
      return { failed: true };
    } else {
      // Increment count for the current IP
      rateLimitMap.set(ip, {
        count: entry.count + 1,
        startTime: entry.startTime,
      });
    }
  }
  return { failed: false };
};
