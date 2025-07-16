import { ipAddress } from "@vercel/functions";
import { type NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { withAuth } from "next-auth/middleware";
import { v4 as uuidv4 } from "uuid";

import {
  allowedRoles,
  type UserAuthType,
} from "./app/lib/types/users.db.types";
import { lang } from "./app/lib/utilities/lang";
import {
  rateLimiter,
  type RateLimitType,
  type RateLimitResult,
} from "./app/lib/utilities/rate-limiter";
import { tooManyRequestsTranslate } from "./public/locales/client/(public)/tooManyRequestsTranslate";

// Helper function to get client IP with better fallback
const getClientIp = (req: NextRequest): string => {
  // Try multiple headers for IP detection
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    // Take the first IP from the chain
    return forwardedFor.split(",")[0].trim();
  }

  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  const vercelIp = ipAddress(req);
  if (vercelIp && vercelIp !== "127.0.0.1") {
    return vercelIp;
  }

  // Fallback to remote address
  const cfConnectingIp = req.headers.get("cf-connecting-ip");
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  // Last resort - use a unique identifier based on user agent + timestamp
  // This prevents all users being treated as the same IP
  const userAgent = req.headers.get("user-agent") || "unknown";
  return `fallback:${Buffer.from(userAgent).toString("base64").substring(0, 16)}`;
};

// Determine rate limit type based on path
const getRateLimitType = (pathname: string): RateLimitType => {
  if (
    pathname.includes("/auth") ||
    pathname.includes("/login") ||
    pathname.includes("/register")
  ) {
    return "auth";
  }
  if (pathname.includes("/graphql")) {
    return "graphql";
  }
  if (pathname.includes("/password") || pathname.includes("/verify")) {
    return "critical";
  }
  return "api";
};

// Create proper 429 response
const createRateLimitResponse = (limit: RateLimitResult) => {
  const response = new NextResponse(
    JSON.stringify({
      error: tooManyRequestsTranslate[lang].title,
      message: `Too many requests. Try again in ${limit.retryAfter} seconds.`,
      retryAfter: limit.retryAfter,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  // Add rate limit headers
  response.headers.set("X-RateLimit-Limit", limit.limit.toString());
  response.headers.set("X-RateLimit-Remaining", limit.remaining.toString());
  response.headers.set("X-RateLimit-Reset", limit.reset.toString());
  response.headers.set("Retry-After", limit.retryAfter.toString());

  return response;
};

// import { createRequestLogger } from "./app/lib/logger/logs";
const PROTECTED_ROUTES = [
  "/account",
  "/checkout",
  "/confirm-email-change",
  // "/verify-email",
];

const DEFAULT_LANGUAGE = "uk";
// const CUSTOM_ERROR_PATH = "/custom-error/429";
const AUTH_PATH = "/auth";
const DASHBOARD_PATH = "/dashboard";
const NOT_FOUND_PATH = "/not-found";
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};

const authMiddleware = async (req: NextRequest) => {
  const { pathname } = req.nextUrl;
  const isAuth = await getToken({ req });
  const user = isAuth?.user as UserAuthType;
  const isAuthorizedUser = allowedRoles.includes(user?.role);
  const response = NextResponse.next();
  const correlationId = uuidv4();

  try {
    // Handle security headers and client identification
    const clientIp = getClientIp(req);
    response.headers.set("x-client-ip", clientIp);
    response.headers.set("X-Correlation-ID", correlationId);

    // ✅ ENHANCED RATE LIMITING - Apply to ALL requests, not just API
    const rateLimitType = getRateLimitType(pathname);
    const limit = await rateLimiter.limit(clientIp, rateLimitType);

    // Always add rate limit headers
    response.headers.set("X-RateLimit-Limit", limit.limit.toString());
    response.headers.set("X-RateLimit-Remaining", limit.remaining.toString());
    response.headers.set("X-RateLimit-Reset", limit.reset.toString());

    if (!limit.allowed) {
      // Return proper 429 response instead of throwing error
      return createRateLimitResponse(limit);
    }

    if (
      isAuth &&
      !pathname.startsWith("/api") &&
      !pathname.startsWith("/verify-email") &&
      !user?.verification?.email_verified
    ) {
      return NextResponse.redirect(new URL("/verify-email", req.url));
    }

    // Handle cookie management
    const refreshToken = req.cookies.get("refreshAccessToken")?.value;
    const langCookie = req.cookies.get("lang");

    // Remove invalid refresh token
    if (!isAuth && refreshToken) {
      response.cookies.delete("refreshAccessToken");
      req.cookies.delete("refreshAccessToken");
    }

    // Set default language if missing
    if (!langCookie) {
      response.cookies.set("lang", DEFAULT_LANGUAGE, {
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 365, // 1 year
      });
    }

    // Check if this is an auth-related route
    const isAuthRoute =
      pathname.startsWith(AUTH_PATH) ||
      pathname === "/auth/login" ||
      pathname === "/auth/register" ||
      pathname === "/login" ||
      pathname === "/register";

    // PRIORITY: Handle authenticated users accessing auth pages
    if (isAuth && isAuthRoute) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Handle email verification logic
    if (pathname === "/verify-email") {
      if (!isAuth) {
        return NextResponse.redirect(new URL(AUTH_PATH, req.url));
      }
      if (user?.verification?.email_verified) {
        return NextResponse.redirect(new URL("/", req.url));
      }
      return NextResponse.next();
    }

    // Redirect to email verification if needed (but not for auth routes)
    if (
      isAuth &&
      !isAuthRoute &&
      !pathname.startsWith("/api") &&
      !pathname.startsWith("/verify-email") &&
      !pathname.startsWith("/_next") &&
      !user?.verification?.email_verified
    ) {
      return NextResponse.redirect(new URL("/verify-email", req.url));
    }

    // Handle route protection logic
    const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
      pathname.startsWith(route)
    );

    if (isAuth) {
      // Admin dashboard protection
      if (pathname.startsWith(DASHBOARD_PATH) && !isAuthorizedUser) {
        return NextResponse.rewrite(new URL(NOT_FOUND_PATH, req.url));
      }
    } else {
      // Redirect unauthenticated users from protected routes
      if (isProtectedRoute) {
        return NextResponse.redirect(new URL(AUTH_PATH, req.url));
      }
      if (pathname.startsWith(DASHBOARD_PATH)) {
        return NextResponse.rewrite(new URL(NOT_FOUND_PATH, req.url));
      }
    }

    return response;
  } catch (error) {
    /* eslint-disable no-console */
    console.error("Middleware error:", error);
    return NextResponse.rewrite(new URL(NOT_FOUND_PATH, req.url));
  }
};

export default withAuth(authMiddleware, {
  callbacks: {
    authorized: ({ token, req }) => {
      const { pathname } = req.nextUrl;

      const needsAuth = PROTECTED_ROUTES.some((route) =>
        pathname.startsWith(route)
      );

      // For protected routes, require authentication
      // For public routes (including auth pages), allow access - our middleware will handle redirects
      return needsAuth ? !!token : true;
    },
  },
  pages: {
    newUser: "/auth/register",
    signIn: AUTH_PATH,
  },
});
