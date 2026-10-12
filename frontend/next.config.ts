import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Cache Components (Partial Prerendering) is intentionally disabled: with it,
  // unknown dynamic params (`/zadachi/<missing>`) answer with HTTP 200 and the
  // 404 page body — a soft 404, which hurts SEO. Conventional rendering gives
  // correct 404 status codes while still streaming via Suspense.
  cacheComponents: false,
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
