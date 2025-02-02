//   const response = NextResponse.next({
//     request: {
//       ...req,
//       headers: newHeaders,
//     },
//   });

import { getToken } from "next-auth/jwt";
import { withAuth } from "next-auth/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { rateLimitIp } from "./components/util/rateLimitIp";

const PROTECTED_ROUTES = ["/account", "/checkout", "/confirm-email-change"];

const DEFAULT_LANGUAGE = "uk";
const ADMIN_ROLE = "admin";
const CUSTOM_ERROR_PATH = "/custom-error/429";
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
  const pathname = req.nextUrl.pathname;
  const isAuth = await getToken({ req });
  const isAdmin = isAuth?.user?.role === ADMIN_ROLE;
  const response = NextResponse.next();

  try {
    // Handle security headers and client identification
    const clientIp =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      req.ip ||
      "unknown";
    response.headers.set("x-client-ip", clientIp);

    // Handle rate limiting for API routes
    if (pathname.startsWith("/api")) {
      const { failed } = rateLimitIp(clientIp);
      if (failed) {
        return NextResponse.rewrite(new URL(CUSTOM_ERROR_PATH, req.url));
      }
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

    // Handle route protection logic
    const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
      pathname.startsWith(route)
    );

    if (isAuth) {
      // Redirect authenticated users away from auth pages
      if (pathname.startsWith(AUTH_PATH)) {
        return NextResponse.redirect(new URL("/", req.url));
      }

      // Admin dashboard protection
      if (pathname.startsWith(DASHBOARD_PATH) && !isAdmin) {
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
      /**
       * Only protect the /account route, all other routes are public
       *
          ***** both are same
      * if (pathname.startsWith("/account")) {
        return !!token;
            }
      * or return pathname.startsWith("/account") ? !!token : true;
 */
      return needsAuth ? !!token : true;
    },
  },
  pages: {
    newUser: "/auth/register",
    // signIn: AUTH_PATH,
  },
});
