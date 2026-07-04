import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { StorySection } from "@/components/public/sections";
import { SiteShell } from "@/components/public/site-shell";
import { getPublishedSiteSnapshot } from "@/server/services/site-snapshot";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const snapshot = await getPublishedSiteSnapshot(slug);
  if (!snapshot) return {};
  return {
    title: `${snapshot.site.coupleNames}'s Love Story | ToNewBeginning`,
    description: `Follow the love story of ${snapshot.site.coupleNames} — from how they met to their wedding day. Milestones, memories, and the moments that brought them together.`,
    alternates: { canonical: `/${slug}/story` },
  };
}

export default async function StoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const snapshot = await getPublishedSiteSnapshot(slug);
  if (!snapshot) notFound();

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://wed.tonewbeginning.com" },
      { "@type": "ListItem", position: 2, name: snapshot.site.coupleNames, item: `https://wed.tonewbeginning.com/${slug}` },
      { "@type": "ListItem", position: 3, name: "Love Story", item: `https://wed.tonewbeginning.com/${slug}/story` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <SiteShell snapshot={snapshot} activeHref={`/${slug}/story`}>
        <StorySection milestones={snapshot.storyMilestones} />
      </SiteShell>
    </>
  );
}
