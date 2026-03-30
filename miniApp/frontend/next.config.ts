import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'fukureco.jp',
      },
      {
        protocol: 'http',
        hostname: 'fukureco.jp',
      }
    ],
  },
};

export default nextConfig;
