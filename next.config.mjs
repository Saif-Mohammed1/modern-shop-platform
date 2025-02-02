import withBundleAnalyzer from "@next/bundle-analyzer";

/** @type {import('next').NextConfig} */
const nextConfig = {
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
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "same-origin",
          },
          {
            key: "Feature-Policy",
            value: "camera 'none'; microphone 'none'",
          },
        ],
      },
    ];
  },
};

const bundleAnalyzerConfig = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

export default bundleAnalyzerConfig(nextConfig);
