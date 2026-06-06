import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
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
