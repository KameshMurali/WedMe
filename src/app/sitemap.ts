import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/constants";
import { prisma } from "@/server/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl;
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/register`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  let weddingRoutes: MetadataRoute.Sitemap = [];
  try {
    const publishedSites = await prisma.weddingSite.findMany({
      where: { publishSettings: { status: "PUBLISHED", noIndex: false } },
      select: {
        slug: true,
        publishSettings: { select: { publishedAt: true } },
      },
    });

    const subPages = [
      "",
      "/story",
      "/events",
      "/schedule",
      "/gallery",
      "/experience",
      "/rsvp",
      "/wishes",
      "/memories",
    ];

    weddingRoutes = publishedSites.flatMap((site) => {
      const lastMod = site.publishSettings?.publishedAt ?? now;
      return subPages.map((sub) => ({
        url: `${base}/${site.slug}${sub}`,
        lastModified: lastMod,
        changeFrequency: "weekly" as const,
        priority: sub === "" ? 0.8 : 0.6,
      }));
    });
  } catch {
    // DB may be unavailable at static build time — static routes only.
  }

  return [...staticRoutes, ...weddingRoutes];
}
