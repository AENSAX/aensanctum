import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  //allowedDevOrigins: ['192.168.31.70'],
  images: {
    remotePatterns: [
      {
        hostname: 'aenstarax.xyz',
      },
    ],
  },
};

export default nextConfig;
