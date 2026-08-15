import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { resolveSiteMetadata } from "@/lib/site-metadata";
import { getPublicSiteStatus, getPublishedSiteSnapshot } from "@/server/services/site-snapshot";

type RouteParams = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { slug } = await params;
  const snapshot = await getPublishedSiteSnapshot(slug);

  if (!snapshot) {
    return {};
  }

  // Everything below is derived from the couple's own content unless they
  // explicitly overrode it in Settings — so a site that never touches the SEO
  // fields still gets a proper title, description, and share image.
  const meta = resolveSiteMetadata(snapshot.site);

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: meta.canonicalUrl,
    },
    robots: snapshot.publish.noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      type: "website",
      title: meta.title,
      description: meta.description,
      url: meta.canonicalUrl,
      images: [meta.ogImageUrl],
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
      images: [meta.ogImageUrl],
    },
  };
}

export default async function WeddingSiteLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}>) {
  const { slug } = await params;
  const snapshot = await getPublishedSiteSnapshot(slug);

  if (!snapshot) {
    // Page-level fallback may render a Coming Soon for draft sites; only 404
    // when the slug truly doesn't exist (both layout and page must agree, or
    // the layout's notFound() short-circuits the page's Coming Soon render).
    const status = await getPublicSiteStatus(slug);
    if (!status.exists) {
      notFound();
    }
  }

  return children;
}
