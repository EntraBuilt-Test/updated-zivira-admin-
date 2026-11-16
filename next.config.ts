import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Phase 2 ERP statement reader uses pdfjs-dist in the browser only; it has an
  // optional Node 'canvas' dependency that must not be bundled.
  webpack: (config) => {
    config.resolve = config.resolve ?? {};
    config.resolve.alias = { ...(config.resolve.alias ?? {}), canvas: false };
    return config;
  },
};

export default nextConfig;
