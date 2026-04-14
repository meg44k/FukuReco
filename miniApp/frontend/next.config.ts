import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['fukureco.jp', 'localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'fukureco.jp',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'fukureco.jp',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/uploads/**',
      }
    ],
  },
};

export default nextConfig;
