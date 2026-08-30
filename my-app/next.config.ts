import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "pg", "@prisma/adapter-pg"],
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
