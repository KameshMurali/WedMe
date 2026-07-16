import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EventsSection } from "@/components/public/sections";
import { SiteShell } from "@/components/public/site-shell";
import { getPublishedSiteSnapshot } from "@/server/services/site-snapshot";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const snapshot = await getPublishedSiteSnapshot(slug);
  if (!snapshot) return {};
  return {
    title: `${snapshot.site.coupleNames}'s Wedding Events | ToNewBeginning`,
    description: `Event details, venues, dates, and dress codes for ${snapshot.site.coupleNames}'s wedding celebration. RSVP to individual ceremonies.`,
    alternates: { canonical: `/${slug}/events` },
  };
}

export default async function EventsPage({ params }: { params: Promise<{ slug: string }> }) {
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
      { "@type": "ListItem", position: 3, name: "Wedding Events", item: `${base}/${slug}/events` },
    ],
  };

  const eventSchemas = snapshot.events.map((event) => ({
    "@context": "https://schema.org",
    "@type": "Event",
    name: `${snapshot.site.coupleNames}'s ${event.title}`,
    startDate: event.startDateTime,
    endDate: event.endDateTime,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: event.locationName
      ? {
          "@type": "Place",
          name: event.locationName,
          address: event.fullAddress ?? event.locationName,
        }
      : undefined,
    organizer: {
      "@type": "Person",
      name: snapshot.site.coupleNames,
    },
    url: `${base}/${slug}/events`,
  }));

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {eventSchemas.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
      <SiteShell snapshot={snapshot} activeHref={`/${slug}/events`}>
        <EventsSection events={snapshot.events} slug={slug} />
      </SiteShell>
    </>
  );
}
