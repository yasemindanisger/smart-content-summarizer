import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Production derlemesinde TypeScript hatalarını yok sayar
    ignoreBuildErrors: true,
  },
  eslint: {
    // Production derlemesinde ESLint hatalarını yok sayar
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
