import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // A stray lockfile one directory up confuses workspace-root inference.
    root: __dirname,
  },
};

export default nextConfig;
