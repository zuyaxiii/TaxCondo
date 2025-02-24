import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
  async headers() {
    return [
      {
        // เพิ่ม path /treasury โดยเฉพาะ
        source: '/treasury/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET' },
        ],
      },
      {
        source: '/api/treasury/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET' },
        ],
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: '/treasury',
        destination: '/treasury',
      },
      {
        source: '/api/treasury',
        destination: '/api/treasury',
      }
    ];
  },
};

export default nextConfig;