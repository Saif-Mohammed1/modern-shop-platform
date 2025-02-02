const rateLimitMap = new Map(); // In-memory store

export const rateLimitIp = (ip: string) => {
  const limit = 30; // Max requests per window (for example, 10 requests)
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
