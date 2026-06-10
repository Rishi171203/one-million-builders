import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow optimized loading of real home photography from Unsplash.
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
    ],
    // Next.js 16 requires an explicit allow-list of qualities (default is [75]).
    qualities: [60, 75, 85],
    // Prefer modern formats; AVIF first, WebP fallback.
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
