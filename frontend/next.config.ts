import type { NextConfig } from "next";

function apiOrigin(): string | null {
  const value = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.origin;
  } catch {
    return null;
  }
}

function buildCsp(): string {
  const origin = apiOrigin();
  const analyticsEnabled = Boolean(process.env.NEXT_PUBLIC_YM_ID?.trim());
  const api = origin ? ` ${origin}` : "";
  const metrika = analyticsEnabled
    ? " https://mc.yandex.ru https://mc.yandex.com https://yastatic.net"
    : "";
  const maybeUnsafeEval =
    process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : "";

  return [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    `script-src 'self' 'unsafe-inline'${maybeUnsafeEval}${metrika}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob:${api}${metrika}`,
    "font-src 'self' data:",
    `connect-src 'self'${api}${metrika}`,
    "media-src 'self'",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
  ].join("; ");
}

const nextConfig: NextConfig = {
  poweredByHeader: false,
  cacheComponents: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Content-Security-Policy-Report-Only",
            value: buildCsp(),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
