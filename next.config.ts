import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },     // <-- skip ESLint at build time
  outputFileTracingRoot: path.resolve(__dirname),
};

export default nextConfig;
