import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  /* config options here */
  experimental: {
    nodeMiddleware: true,
    
    // allowedDevOrigins: ["http://192.168.29.8:3000"], // Replace with your local IP
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
        hostname: "media-hosting.imagekit.io", // <-- Add this
        pathname: "/**",
      },
    ],
  },
  output: "standalone",
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(png|jpe?g|gif|svg)$/i,
      type: "asset/resource",
    });

    return config;
  },
};

export default nextConfig;
