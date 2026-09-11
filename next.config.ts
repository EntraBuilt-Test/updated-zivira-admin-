import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      {
        source: '/backend-api/:path*',
        // Proxy to your Render backend to bypass CORS
        destination: 'https://zivira-backend-7qkt.onrender.com/api/:path*', 
      },
    ];
  },
};

export default nextConfig;
