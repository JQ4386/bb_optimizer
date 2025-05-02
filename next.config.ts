import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configure Next.js for static export
  output: 'export',
  // Disable default image optimization (often needed for static export)
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
