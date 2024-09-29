import { getToken } from "next-auth/jwt";
import { withAuth } from "next-auth/middleware";
import { NextResponse, type NextRequest } from "next/server";
const protectedRoutes = [
  "/account",
  "/checkout",
  "/confirm-email-change",
  // "/dashboard",
]; // only this shoud be proteted othwr routes should be public
const authMiddleware = async (req: NextRequest) => {
  const forwardedFor = req.headers.get("x-forwarded-for");
  const lang = req.headers.get("lang") ?? "uk";
  const clientIp = forwardedFor
    ? forwardedFor
    : req.headers.get("x-real-ip") ?? "";
  // Store client IP in request headers or cookies for further use

  req.headers.set("x-client-ip", clientIp);
  req.headers.set("lang", lang);
  const pathname = req.nextUrl.pathname;
  const isAuth = await getToken({ req });
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isAuth && pathname.startsWith("/auth")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (isProtectedRoute && !isAuth) {
    return NextResponse.redirect(new URL("/auth", req.url));
  }

  if (pathname.startsWith("/dashboard") && isAuth && isAuth.role === "admin") {
    return NextResponse.next();
  } else if (
    pathname.startsWith("/dashboard") &&
    isAuth &&
    isAuth.role !== "admin"
  ) {
    return NextResponse.rewrite(new URL("/not-found", req.url));
  }
  // if (isAuth &&isAuth. &&pathname.startsWith("/dashboard")) {
  //   return NextResponse.json
  // Allow other routes like / to be accessible
  return NextResponse.next();
};
export default withAuth(authMiddleware, {
  callbacks: {
    authorized: ({ token, req }) => {
      const { pathname } = req.nextUrl;
      const isProtectedRoute = protectedRoutes.some((route) =>
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
      if (isProtectedRoute) {
        return !!token;
      }
      return true;
      // Only protect the defined routes
      // return isProtectedRoute ? !!token : true;
    },
  },
  pages: {
    //  signIn: "/auth"

    newUser: "/auth/register",
  },
});
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
