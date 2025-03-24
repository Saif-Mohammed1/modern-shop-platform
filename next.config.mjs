import withBundleAnalyzer from "@next/bundle-analyzer";
import { config } from "dotenv";
config({ path: "./config/.env" }); // Add this at top
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {},
    // reactCompiler: true,
    staleTimes: {
      dynamic: 30,
      static: 600,
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "via.placeholder.com", port: "" },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        port: "",
      },
      {
        protocol: "https",
        hostname: "loremflickr.com",
        port: "",
      },
    ],
  },
  // async headers() {
  //   return [
  //     {
  //       source: "/(.*)",
  //       headers: [
  //         {
  //           key: "Strict-Transport-Security",
  //           value: "max-age=63072000; includeSubDomains; preload",
  //         },
  //         // {
  //         //   key: "Content-Security-Policy",
  //         //   value:
  //         //     "default-src 'self'; " +
  //         //     "script-src 'self' 'unsafe-inline' *.trusted.com; " + // Add your trusted domain
  //         //     "style-src 'self' 'unsafe-inline'; " +
  //         //     "img-src 'self' data: https: res.cloudinary.com via.placeholder.com picsum.photos loremflickr.com; " +
  //         //     "font-src 'self'; " +
  //         //     "connect-src 'self' *.api.com; " + // Add your API domain
  //         //     "frame-src 'none'; " +
  //         //     "object-src 'none'; " +
  //         //     "base-uri 'self'; " +
  //         //     "form-action 'self';",
  //         // },
  //         {
  //           key: "X-Content-Type-Options",
  //           value: "nosniff",
  //         },
  //         {
  //           key: "X-Frame-Options",
  //           value: "DENY",
  //         },
  //         {
  //           key: "X-XSS-Protection",
  //           value: "1; mode=block",
  //         },
  //         {
  //           key: "Referrer-Policy",
  //           value: "strict-origin-when-cross-origin",
  //         },
  //         {
  //           key: "Permissions-Policy",
  //           value:
  //             "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  //         },
  //         {
  //           key: "Cross-Origin-Opener-Policy",
  //           value: "same-origin",
  //         },
  //         {
  //           key: "Cross-Origin-Embedder-Policy",
  //           value: "require-corp",
  //         },
  //       ],
  //     },
  //   ];
  // },
};

const bundleAnalyzerConfig = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

export default bundleAnalyzerConfig(nextConfig);
