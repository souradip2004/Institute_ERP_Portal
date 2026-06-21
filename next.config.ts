import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },

  images: {
    // domains: [avatars.githubusercontent.com, lh3.googleusercontent.com],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        pathname: "/**",
      },

      {
        protocol: "https",
        hostname: "smartcampuserp.s3.ap-south-1.amazonaws.com",
        pathname: "/**",
      },
    ],
  },
  output: "standalone",
};

export default nextConfig;
