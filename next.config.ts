import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Fix Turbopack workspace root inference when there are multiple
   * lockfiles on the machine (e.g. one in your home directory).
   * This makes sure Next.js treats the ColorHash AI folder as the root.
   */
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
