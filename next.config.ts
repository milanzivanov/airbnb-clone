import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com"
      },
      {
        protocol: "https",
        hostname: "ocgeuaanllqmawsggybj.supabase.co"
      }
    ]
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb" // Increase the limit to 5MB
    }
  },
  reactStrictMode: false
};

export default nextConfig;
