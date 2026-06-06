import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      // Vercel Blob storage — uploaded event banners, hero, gallery, story,
      // dress code images live here. The hostname uses a per-store subdomain
      // (e.g. `okaq5dculfcbb8fd.public.blob.vercel-storage.com`). The wildcard
      // form `*.public.blob.vercel-storage.com` was rejected by the Vercel
      // image optimizer in this project, so we whitelist the concrete store
      // hostname plus the legacy `public.blob.vercel-storage.com` for safety.
      {
        protocol: "https",
        hostname: "okaq5dculfcbb8fd.public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
