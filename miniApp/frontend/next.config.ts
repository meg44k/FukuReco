import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'fukureco.jp',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.fukureco.jp',
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
