import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    ...(process.env.DEV_ALLOWED_ORIGIN ? [process.env.DEV_ALLOWED_ORIGIN] : []),
    'localhost:3000'
  ],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'fukureco.jp', pathname: '/**' },
      { protocol: 'https', hostname: '**.fukureco.jp', pathname: '/**' },
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
