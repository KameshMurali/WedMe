import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { GallerySection, VideoSection } from "@/components/public/sections";
import { SiteShell } from "@/components/public/site-shell";
import { getPublishedSiteSnapshot } from "@/server/services/site-snapshot";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const snapshot = await getPublishedSiteSnapshot(slug);
  if (!snapshot) return {};
  return {
    title: `${snapshot.site.coupleNames}'s Wedding Gallery | ToNewBeginning`,
    description: `Photos and videos from ${snapshot.site.coupleNames}'s wedding celebration: ceremony highlights, candid moments, and memories shared by the couple and guests.`,
    alternates: { canonical: `/${slug}/gallery` },
  };
}

export default async function GalleryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const snapshot = await getPublishedSiteSnapshot(slug);
  if (!snapshot) notFound();

  const base = `https://wed.tonewbeginning.com`;
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: base },
      { "@type": "ListItem", position: 2, name: snapshot.site.coupleNames, item: `${base}/${slug}` },
      { "@type": "ListItem", position: 3, name: "Gallery", item: `${base}/${slug}/gallery` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <SiteShell snapshot={snapshot} activeHref={`/${slug}/gallery`}>
        <GallerySection assets={snapshot.mediaAssets} />
        <VideoSection videos={snapshot.embeddedVideos} />
      </SiteShell>
    </>
  );
}
