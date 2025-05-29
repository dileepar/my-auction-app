import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    VERCEL_URL: process.env.VERCEL_URL,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets.catawiki.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
