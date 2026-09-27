import type { Metadata, Route } from "next";
import { notFound, redirect } from "next/navigation";

import { resolveSiteMetadata } from "@/lib/site-metadata";
import { getSiteAccess } from "@/server/services/site-access";
import { getPublicSiteStatus, getPublishedSiteSnapshot } from "@/server/services/site-snapshot";

type RouteParams = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { slug } = await params;

  // Metadata is the one thing that renders even when the page does not, so it
  // has to respect the gate too. Otherwise a locked site still leaks the
  // couple's names, their photo and their wedding date to anyone who requests
  // the URL, or to any chat app that unfurls a shared link.
  const access = await getSiteAccess(slug);
  if (access && !access.ok) {
    return {
      title: "Private wedding website",
      robots: { index: false, follow: false },
    };
  }

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

  // The single choke point for all eleven public routes. Every one of them
  // lives under this layout, so the gate belongs here rather than repeated in
  // each page where one omission would silently expose a site.
  //
  // redirect() throws, which aborts the render, so nothing from the couple's
  // site reaches the response.
  const access = await getSiteAccess(slug);
  if (access && !access.ok) {
    redirect(`/unlock/${slug}` as Route);
  }

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
