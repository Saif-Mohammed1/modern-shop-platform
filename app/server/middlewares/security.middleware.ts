// export const securityHeaders = (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   res.set({
//     "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
//     "X-Content-Type-Options": "nosniff",
//     "X-Frame-Options": "DENY",
//     "Content-Security-Policy": "default-src 'self'",
//   });
//   next();
// };
