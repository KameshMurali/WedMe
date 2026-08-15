import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RegistrySection } from "@/components/public/sections";
import { SiteShell } from "@/components/public/site-shell";
import { getPublishedSiteSnapshot } from "@/server/services/site-snapshot";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const snapshot = await getPublishedSiteSnapshot(slug);
  if (!snapshot) return {};
  return {
    title: `${snapshot.site.coupleNames}'s Gift Registry | ToNewBeginning`,
    description: `Gift registry for ${snapshot.site.coupleNames}'s wedding. The couple's chosen registries, experiences, and charities, all in one place.`,
    alternates: { canonical: `/${slug}/registry` },
  };
}

export default async function RegistryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const snapshot = await getPublishedSiteSnapshot(slug);
  if (!snapshot) notFound();

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://wed.tonewbeginning.com" },
      { "@type": "ListItem", position: 2, name: snapshot.site.coupleNames, item: `https://wed.tonewbeginning.com/${slug}` },
      { "@type": "ListItem", position: 3, name: "Registry", item: `https://wed.tonewbeginning.com/${slug}/registry` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <SiteShell snapshot={snapshot} activeHref={`/${slug}/registry`}>
        <RegistrySection links={snapshot.registryLinks} />
      </SiteShell>
    </>
  );
}
