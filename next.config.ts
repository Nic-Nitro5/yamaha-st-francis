import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Dashboard photo uploads: the browser resizes each photo first, so one request stays well
    // under Vercel's 4.5MB function body limit.
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
