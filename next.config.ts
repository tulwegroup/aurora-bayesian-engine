import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove standalone output for preview compatibility
  // output: "standalone",
  
  // Add trailing slash for proper routing
  trailingSlash: true,
  
  // Ensure proper asset prefix for preview
  assetPrefix: process.env.NODE_ENV === 'production' ? undefined : '',
  
  // Use Node.js runtime instead of edge to avoid build issues
  output: 'standalone',
  
  typescript: {
    ignoreBuildErrors: false, // Be stricter with TypeScript
  },
  reactStrictMode: false,
  
  // Add headers for proper CORS in preview
  async headers() {
    return [
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
