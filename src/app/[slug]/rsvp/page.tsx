import { RsvpForm } from "@/components/forms/rsvp-form";
import { SiteShell } from "@/components/public/site-shell";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { getPublishedSiteSnapshot } from "@/server/services/site-snapshot";

export default async function RsvpPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const snapshot = await getPublishedSiteSnapshot(slug);
  if (!snapshot) return null;

  return (
    <SiteShell snapshot={snapshot} activeHref={`/${slug}/rsvp`}>
      <section className="section-shell mt-16">
        <SectionHeading
          eyebrow="RSVP"
          title="Let the couple know how you’ll celebrate."
          description="Reply for one or more events, share your meal preference, and leave any travel or accessibility notes."
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <RsvpForm
              slug={slug}
              isOpen={snapshot.publish.isRsvpOpen}
              events={snapshot.events.map((event) => ({
                id: event.id,
                title: event.title,
                dayLabel: event.dayLabel,
              }))}
            />
          </Card>
          <Card className="space-y-4">
            <h3 className="font-display text-3xl text-[color:var(--text)]">Need a little help?</h3>
            <p className="text-sm leading-7 text-[color:var(--muted)]">
              If your invite includes a code or family grouping, add it to help us match your response.
            </p>
            <ul className="space-y-3 text-sm leading-7 text-[color:var(--muted)]">
              <li>Reply for only the events you’ve been invited to.</li>
              <li>Please include accessibility or travel needs in the form.</li>
              <li>Your response will be visible to the couple in their dashboard instantly.</li>
            </ul>
          </Card>
        </div>
      </section>
    </SiteShell>
  );
}
