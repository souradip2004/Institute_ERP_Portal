import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    nodeMiddleware: true,
    
  },
  images: {
    // domains: [avatars.githubusercontent.com, lh3.googleusercontent.com],
    remotePatterns: [ {
      protocol: 'https',
      hostname: 'lh3.googleusercontent.com',
      pathname: '/**',
    },
    {
      protocol: 'https',
      hostname: 'avatars.githubusercontent.com',
      pathname: '/**',
    },
  ],
  },
  output: 'standalone',

};

export default nextConfig;
