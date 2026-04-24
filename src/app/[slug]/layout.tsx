import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getPublishedSiteSnapshot } from "@/server/services/site-snapshot";

type RouteParams = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { slug } = await params;
  const snapshot = await getPublishedSiteSnapshot(slug);

  if (!snapshot) {
    return {};
  }

  return {
    title: snapshot.site.seoTitle ?? `${snapshot.site.brandName} | Wedding Website`,
    description:
      snapshot.site.seoDescription ??
      `${snapshot.site.coupleNames} invite you to celebrate their wedding journey.`,
    alternates: snapshot.site.canonicalUrl
      ? {
          canonical: snapshot.site.canonicalUrl,
        }
      : undefined,
    robots: snapshot.publish.noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title: snapshot.site.seoTitle ?? snapshot.site.brandName,
      description:
        snapshot.site.seoDescription ??
        `${snapshot.site.coupleNames} invite you to celebrate their wedding journey.`,
      images: snapshot.site.ogImageUrl ? [snapshot.site.ogImageUrl] : [],
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
    notFound();
  }

  return children;
}
