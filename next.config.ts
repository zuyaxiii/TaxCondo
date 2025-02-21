import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
  async rewrites() {
    return [
      {
        source: '/api/treasury',
        destination: '/api/treasury',
      },
    ];
  },
};

export default nextConfig;
