import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
      { protocol: "https", hostname: "**" },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },
  // Protected admin HTML must never be cached/reused by the browser or any
  // intermediary. proxy.ts also sets this, but Next's own Cache-Control
  // computed for dynamically-rendered pages otherwise wins for the document
  // response, so it's set here too (config-level headers apply before the
  // page render pipeline's own headers).
  async headers() {
    return [
      {
        source: "/admin/:path*",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
    ];
  },
};

export default nextConfig;
