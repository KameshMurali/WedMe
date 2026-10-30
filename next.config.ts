import type { NextConfig } from "next";

// Content-Security-Policy tuned to exactly what this app loads:
//   • scripts/styles: self + 'unsafe-inline' (Next injects inline hydration
//     scripts and components use inline styles; a nonce-based CSP would be
//     stricter but needs per-request middleware — deferred to avoid risking
//     hydration breakage).
//   • images: any HTTPS host (couples paste arbitrary image URLs) + data/blob.
//   • frames: YouTube embeds, and Paddle's checkout overlay.
//   • connect: same-origin APIs, Vercel Blob client uploads, Paddle's checkout
//     XHRs.
//   • everything else locked down (object-src none, base-uri/form-action self,
//     frame-ancestors self to prevent clickjacking).
//
// PADDLE
//
// The three paddle.com entries below are not speculative: without them
// checkout fails for every buyer, every time, and nothing in this repo would
// catch it. paddle-checkout-button.tsx loads
// https://cdn.paddle.com/paddle/v2/paddle.js at click time, so a blocked
// script fires `script.onerror` and the button reports "We couldn't open
// checkout." — a quiet, total failure that only shows up once real money is
// on the line.
//
// It is invisible today because `checkoutEnabled` (src/lib/pricing.ts) is
// derived from unset env vars, so the script is never requested in any
// environment that currently runs, and `npm run test:layout` never exercises
// it either.
//
// The hostnames are deliberately narrow rather than *.paddle.com. Confirm them
// against Paddle's own CSP guidance during sandbox testing and widen only if
// the browser console shows a blocked host — the sandbox uses its own
// sandbox-* subdomains, which is why both are listed.
const paddleScript = "https://cdn.paddle.com";
const paddleFrames = [
  "https://buy.paddle.com",
  "https://sandbox-buy.paddle.com",
].join(" ");
const paddleConnect = [
  "https://checkout-service.paddle.com",
  "https://sandbox-checkout-service.paddle.com",
  "https://api.paddle.com",
  "https://sandbox-api.paddle.com",
].join(" ");

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  `script-src 'self' 'unsafe-inline' ${paddleScript}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "media-src 'self' blob: https:",
  "worker-src 'self' blob:",
  `connect-src 'self' https://blob.vercel-storage.com https://*.blob.vercel-storage.com ${paddleConnect}`,
  `frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com ${paddleFrames}`,
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
    // `payment=()` disabled the Payment Request API outright, which is what
    // Apple Pay and Google Pay inside Paddle's checkout are built on — they
    // would simply not appear as options. Allowing it for self and Paddle's
    // checkout origin keeps every other surface locked down.
    key: "Permissions-Policy",
    value:
      'camera=(), microphone=(), geolocation=(), payment=(self "https://buy.paddle.com" "https://sandbox-buy.paddle.com"), usb=(), interest-cohort=()',
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
