import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow optimized loading of real home photography from Unsplash.
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
