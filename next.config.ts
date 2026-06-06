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
      // Vercel Blob storage — every dashboard upload (event banners, hero,
      // gallery, story, dress code) is served from here. The hostname uses a
      // per-store subdomain (e.g. okaq5dculfcbb8fd.public.blob...), so we
      // match the whole `*.public.blob.vercel-storage.com` family.
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
