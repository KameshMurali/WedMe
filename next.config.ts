import type { NextConfig } from "next";

// Content-Security-Policy tuned to exactly what this app loads:
//   • scripts/styles: self + 'unsafe-inline' (Next injects inline hydration
//     scripts and components use inline styles; a nonce-based CSP would be
//     stricter but needs per-request middleware — deferred to avoid risking
//     hydration breakage).
//   • images: any HTTPS host (couples paste arbitrary image URLs) + data/blob.
//   • frames: YouTube embeds only.
//   • connect: same-origin APIs + Vercel Blob client uploads.
//   • everything else locked down (object-src none, base-uri/form-action self,
//     frame-ancestors self to prevent clickjacking).
const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "media-src 'self' blob: https:",
  "worker-src 'self' blob:",
  "connect-src 'self' https://blob.vercel-storage.com https://*.blob.vercel-storage.com",
  "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com",
  "frame-ancestors 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  // Force HTTPS for 2 years; harmless even before preload submission.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
];

const nextConfig: NextConfig = {
  typedRoutes: true,
  async headers() {
    return [
      {
        // Apply the security headers to every route.
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  images: {
    // This is a multi-tenant SaaS where couples paste arbitrary image URLs
    // (vendor portfolios, Vogue, Webflow CDNs, Instagram, etc.) into hero,
    // event, story, and gallery fields. Whitelisting hostnames one-by-one
    // breaks every new source. The `**` wildcard accepts any HTTPS host.
    //
    // Safety still applies:
    //   • next/image rejects non-image content-types
    //   • SVG is blocked (dangerouslyAllowSVG stays off — default)
    //   • The optimizer enforces source size + transform rate limits
    //   • If a URL fails (bad host, 404, slow upstream) the optimizer returns
    //     400 and the visual stays a broken-image, never crashes the page
    //
    // If you ever need to restrict this (cost / abuse), replace `**` with a
    // concrete list and add the Vercel Blob store hostname back explicitly.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
