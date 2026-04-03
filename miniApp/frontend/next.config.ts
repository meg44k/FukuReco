import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['fukureco.jp'],
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
      }
    ],
  },
};

export default nextConfig;
