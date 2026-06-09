import type { NextConfig } from "next";

// Applied to every response. Gives Zscaler / enterprise proxies the signals
// they need to trust the site, and hardens it against common web attacks.
const securityHeaders = [
  // Prevent MIME-type sniffing — one of the first things scanners check.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Block the site from being framed by a third-party page (clickjacking).
  { key: "X-Frame-Options", value: "DENY" },
  // Enforce HTTPS for 2 years, including subdomains, and allow preload submission.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Limit referrer info sent to cross-origin requests.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disable browser features not needed by a wedding website.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  {
    key: "Content-Security-Policy",
    value: [
      // Fonts and API calls must come from this origin.
      "default-src 'self'",
      // Next.js requires unsafe-inline for its hydration scripts.
      "script-src 'self' 'unsafe-inline'",
      // Tailwind utility classes and theme CSS variables are injected inline.
      "style-src 'self' 'unsafe-inline'",
      // Couples paste arbitrary image URLs (Vercel Blob, S3, vendor sites, etc.)
      // so img-src must allow all HTTPS sources. data: and blob: cover
      // cropped/previewed uploads before they are persisted.
      "img-src 'self' data: blob: https:",
      // Videos follow the same storage pattern as images.
      "media-src 'self' blob: https:",
      // Fonts are self-hosted via @fontsource — no external CDN needed.
      "font-src 'self'",
      // XHR / fetch targets: own API routes only.
      "connect-src 'self'",
      // No plug-ins, no embeds.
      "object-src 'none'",
      // No iframes from any origin.
      "frame-src 'none'",
      // Prevent this page from being embedded anywhere (CSP equivalent of X-Frame-Options).
      "frame-ancestors 'none'",
      // Restrict <base> tag to same origin.
      "base-uri 'self'",
      // Forms must submit to this origin only.
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  typedRoutes: true,
  async headers() {
    return [
      {
        // Apply to every route.
        source: "/(.*)",
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
