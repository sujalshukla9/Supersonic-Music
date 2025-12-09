import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Netlify
  output: 'standalone',

  // Image optimization configuration
  images: {
    unoptimized: true, // Required for static hosting
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
        pathname: '/vi/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        pathname: '/api/**',
      },
    ],
  },

  // Disable type checking during build (speeds up deployment)
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
