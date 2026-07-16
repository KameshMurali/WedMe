import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, Clock3, Heart, MapPin, PlayCircle, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeading } from "@/components/ui/section-heading";
import { GallerySpotlight } from "@/components/public/gallery-spotlight";
import { findTemplateByKey } from "@/lib/template-registry";
import { getYoutubeEmbedUrl } from "@/lib/youtube";
import { cn, formatDate, formatEnumLabel, formatTimeRange, groupBy } from "@/lib/utils";
import type { SiteSnapshot } from "@/types";

function glassPanel(className?: string) {
  return cn(
    "rounded-[calc(var(--radius)-0.35rem)] border border-[color:var(--accent)]/14 bg-white/72 backdrop-blur-xl",
    className,
  );
}

function metricCard(label: string, value: string, className?: string) {
  return (
    <div className={glassPanel(cn("px-4 py-4", className))}>
      <p className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--muted)]">{label}</p>
      <p className="mt-3 text-base font-semibold text-[color:var(--text)]">{value}</p>
    </div>
  );
}

function HeroMediaFrame({
  snapshot,
  className,
  imageClassName,
  imageSizes = "100vw",
}: {
  snapshot: SiteSnapshot;
  className?: string;
  imageClassName?: string;
  imageSizes?: string;
}) {
  return (
    <div className={cn("relative overflow-hidden rounded-[calc(var(--radius)+0.2rem)]", className)}>
      {snapshot.site.heroVideoUrl ? (
        <video
          src={snapshot.site.heroVideoUrl}
          autoPlay
          muted
          loop
          playsInline
          className={cn("h-full w-full object-cover", imageClassName)}
        />
      ) : snapshot.site.heroImageUrl ? (
        <Image
          src={snapshot.site.heroImageUrl}
          alt={snapshot.site.coupleNames}
          width={1600}
          height={900}
          priority
          sizes={imageSizes}
          className={cn("h-full w-full object-cover", imageClassName)}
        />
      ) : (
        <div className={cn("h-full w-full bg-hero-mesh", imageClassName)} />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
    </div>
  );
}

function HeroCopy({ snapshot, large = false, dark = false }: { snapshot: SiteSnapshot; large?: boolean; dark?: boolean }) {
  return (
    <div className="max-w-3xl">
      <Badge className={dark ? "border-white/20 bg-white/10 text-white" : undefined}>{snapshot.site.brandName}</Badge>
      <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
        <span
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-4 py-2",
            dark ? "bg-white/10 text-white/85 ring-1 ring-white/10" : "bg-white/78 text-[color:var(--muted)] ring-1 ring-black/5",
          )}
        >
          <CalendarDays className="h-4 w-4" />
          {formatDate(snapshot.site.weddingDate)}
        </span>
        {snapshot.site.locationSummary ? (
          <span
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-4 py-2",
              dark ? "bg-white/10 text-white/85 ring-1 ring-white/10" : "bg-white/78 text-[color:var(--muted)] ring-1 ring-black/5",
            )}
          >
            <MapPin className="h-4 w-4" />
            {snapshot.site.locationSummary}
          </span>
        ) : null}
      </div>
      <h1
        className={cn(
          "mt-6 font-display leading-[0.95]",
          large ? "text-5xl sm:text-6xl lg:text-7xl" : "text-4xl sm:text-5xl lg:text-6xl",
          dark ? "text-white" : "text-[color:var(--text)]",
        )}
      >
        {snapshot.site.headline}
      </h1>
      {(snapshot.site.subtitle ?? snapshot.site.tagline) ? (
        <p
          className={cn(
            "mt-5 max-w-2xl text-base leading-8 sm:text-lg",
            dark ? "text-white/78" : "text-[color:var(--muted)]",
          )}
        >
          {snapshot.site.subtitle ?? snapshot.site.tagline}
        </p>
      ) : null}
      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild>
          <Link href={`/${snapshot.site.slug}/story` as Route}>Our Story</Link>
        </Button>
        <Button asChild variant={dark ? "secondary" : "outline"}>
          <Link href={`/${snapshot.site.slug}/events` as Route}>Events</Link>
        </Button>
        <Button asChild variant={dark ? "secondary" : "outline"}>
          <Link href={`/${snapshot.site.slug}/rsvp` as Route}>RSVP</Link>
        </Button>
        <Button asChild variant={dark ? "secondary" : "outline"}>
          <Link href={`/${snapshot.site.slug}/gallery` as Route}>Gallery</Link>
        </Button>
      </div>
    </div>
  );
}

function HeroSectionClassic({ snapshot }: { snapshot: SiteSnapshot }) {
  const spotlightEvent = snapshot.events[0];

  return (
    <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.05fr_0.95fr] lg:p-12">
      <div className="self-center">
        <HeroCopy snapshot={snapshot} />
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {metricCard("Celebrations", `${snapshot.events.length} curated events`)}
          {metricCard("Story", `${snapshot.storyMilestones.length} milestones shared`)}
          {metricCard("Guest flow", "RSVP, gallery, messages")}
        </div>
      </div>
      <div className="grid gap-4">
        <HeroMediaFrame snapshot={snapshot} className="min-h-[360px]" imageClassName="h-full min-h-[360px]" imageSizes="(max-width: 1024px) 100vw, 48vw" />
        <div className="grid gap-4 sm:grid-cols-[1.1fr_0.9fr]">
          <div className={glassPanel("px-5 py-5")}>
            <p className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--muted)]">Weekend note</p>
            <p className="mt-4 text-lg font-semibold text-[color:var(--text)]">
              A warm invitation to celebrate, travel well, and experience each event with ease.
            </p>
          </div>
          <div className={glassPanel("px-5 py-5")}>
            <p className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--muted)]">First event</p>
            <p className="mt-4 font-display text-3xl text-[color:var(--text)]">
              {spotlightEvent?.title ?? "Celebration begins"}
            </p>
            {spotlightEvent ? (
              <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">
                {formatDate(spotlightEvent.startDateTime)}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroSectionEditorial({ snapshot }: { snapshot: SiteSnapshot }) {
  const firstMilestone = snapshot.storyMilestones[0];
  const firstEvent = snapshot.events[0];

  return (
    <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[0.9fr_1.1fr] lg:p-12">
      <div className="self-center">
        <div className={glassPanel("mb-6 inline-flex max-w-md items-center gap-3 px-4 py-3")}>
          <Heart className="h-4 w-4 text-[color:var(--primary)]" />
          <p className="text-sm text-[color:var(--muted)]">An editorial, memory-rich wedding website for guests to explore.</p>
        </div>
        <HeroCopy snapshot={snapshot} large />
      </div>
      <div className="relative">
        <div className="absolute -left-4 top-10 hidden h-28 w-28 rounded-full bg-[color:var(--accent)]/16 blur-3xl lg:block" />
        <HeroMediaFrame
          snapshot={snapshot}
          className="ml-auto min-h-[420px] max-w-[44rem]"
          imageClassName="h-full min-h-[420px]"
          imageSizes="(max-width: 1024px) 100vw, min(44rem, 55vw)"
        />
        <div className="relative -mt-14 grid gap-4 px-4 sm:grid-cols-2">
          <div className={glassPanel("px-5 py-5")}>
            <p className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--muted)]">Story highlight</p>
            <p className="mt-3 font-display text-3xl text-[color:var(--text)]">
              {firstMilestone?.title ?? "Our favourite chapter"}
            </p>
            <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">
              {firstMilestone?.description ?? "Every chapter of the journey has a place in this experience."}
            </p>
          </div>
          <div className={glassPanel("px-5 py-5")}>
            <p className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--muted)]">Upcoming event</p>
            <p className="mt-3 text-lg font-semibold text-[color:var(--text)]">
              {firstEvent?.title ?? "Weekend celebration"}
            </p>
            <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">
              {firstEvent ? `${formatDate(firstEvent.startDateTime)} at ${firstEvent.locationName}` : "Guests will find timing, maps, and details here."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroSectionSplit({ snapshot }: { snapshot: SiteSnapshot }) {
  const firstEvent = snapshot.events[0];

  return (
    <div className="grid overflow-hidden lg:grid-cols-[0.88fr_1.12fr]">
      <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-14">
        <HeroCopy snapshot={snapshot} />
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {metricCard("Events", `${snapshot.events.length} celebrations planned`)}
          {metricCard("For guests", "All the details, one place")}
        </div>
      </div>
      <div className="relative min-h-[520px] border-t border-[color:var(--accent)]/14 lg:border-l lg:border-t-0">
        <HeroMediaFrame snapshot={snapshot} className="absolute inset-0 rounded-none" imageClassName="h-full min-h-[520px]" imageSizes="(max-width: 1024px) 100vw, 56vw" />
        <div className="absolute inset-0 bg-gradient-to-l from-black/12 via-transparent to-[color:var(--background)]/16" />
        <div className="absolute bottom-6 left-6 right-6 grid gap-4 sm:grid-cols-2">
          <div className={glassPanel("px-5 py-5")}>
            <p className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--muted)]">Weekend focus</p>
            <p className="mt-3 text-lg font-semibold text-[color:var(--text)]">
              A spacious, modern layout that keeps guests oriented at a glance.
            </p>
          </div>
          <div className={glassPanel("px-5 py-5")}>
            <p className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--muted)]">First stop</p>
            <p className="mt-3 font-display text-3xl text-[color:var(--text)]">
              {firstEvent?.title ?? "Celebration details"}
            </p>
            <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">
              {firstEvent ? `${formatDate(firstEvent.startDateTime)} · ${firstEvent.locationName}` : "Date, place, and guidance live here."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroSectionCinematic({ snapshot }: { snapshot: SiteSnapshot }) {
  const highlightEvents = snapshot.events.slice(0, 3);

  return (
    <div className="relative min-h-[620px] overflow-hidden">
      <HeroMediaFrame snapshot={snapshot} className="absolute inset-0 rounded-none" imageClassName="h-full min-h-[620px]" />
      <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(10,8,12,0.82)_0%,rgba(10,8,12,0.46)_42%,rgba(10,8,12,0.74)_100%)]" />
      <div className="absolute inset-0 premium-grid opacity-10" />
      <div className="relative grid min-h-[620px] gap-8 p-6 sm:p-8 lg:grid-cols-[1.15fr_0.85fr] lg:p-14">
        <div className="self-end">
          <HeroCopy snapshot={snapshot} large dark />
        </div>
        <div className="grid gap-4 self-start lg:self-center">
          {highlightEvents.map((event) => (
            <div
              key={event.id}
              className="rounded-[calc(var(--radius)-0.2rem)] border border-white/12 bg-black/26 px-5 py-5 text-white backdrop-blur-xl"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/60">{event.dayLabel}</p>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">
                  {formatEnumLabel(event.audience, "ALL GUESTS")}
                </span>
              </div>
              <h3 className="mt-4 font-display text-3xl text-white">{event.title}</h3>
              <p className="mt-2 text-sm leading-7 text-white/72">
                {formatDate(event.startDateTime)} · {event.locationName}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HeroSectionCelebration({ snapshot }: { snapshot: SiteSnapshot }) {
  const highlightEvents = snapshot.events.slice(0, 4);

  return (
    <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.05fr_0.95fr] lg:p-12">
      <div className="self-center">
        <div className="mb-6 inline-flex items-center gap-3 rounded-full bg-[color:var(--accent)]/12 px-4 py-2 text-sm text-[color:var(--primary)]">
          <Sparkles className="h-4 w-4" />
          A celebration across many beautiful moments and memories
        </div>
        <HeroCopy snapshot={snapshot} large />
        <div className="mt-8 flex flex-wrap gap-3">
          {highlightEvents.map((event) => (
            <span
              key={event.id}
              className="inline-flex items-center gap-2 rounded-full border border-[color:var(--accent)]/18 bg-white/68 px-4 py-2 text-sm text-[color:var(--muted)]"
            >
              <Sparkles className="h-3.5 w-3.5 text-[color:var(--primary)]" />
              {event.title}
            </span>
          ))}
        </div>
      </div>
      <div className="grid gap-4">
        <HeroMediaFrame snapshot={snapshot} className="min-h-[360px]" imageClassName="h-full min-h-[360px]" imageSizes="(max-width: 1024px) 100vw, 48vw" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className={glassPanel("px-5 py-5")}>
            <p className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--muted)]">Guest note</p>
            <p className="mt-3 text-lg font-semibold text-[color:var(--text)]">
              Travel tips, dress guidance, RSVP flows, and memories all live in one welcoming place.
            </p>
          </div>
          <div className={glassPanel("px-5 py-5")}>
            <p className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--muted)]">Live site</p>
            <p className="mt-3 font-display text-3xl text-[color:var(--text)]">/{snapshot.site.slug}</p>
            <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">A shareable wedding site that feels curated, not generic.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HeroSection({ snapshot }: { snapshot: SiteSnapshot }) {
  const template = findTemplateByKey(snapshot.theme.templateKey);

  return (
    <section className="section-shell pt-10">
      <div className="relative overflow-hidden rounded-[calc(var(--radius)+0.7rem)] border border-[color:var(--accent)]/16 bg-[color:var(--surface)] rich-shadow">
        <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-transparent to-[color:var(--accent)]/10" />
        <div className="absolute inset-0 premium-grid opacity-15" />
        <div className="relative">
          {template.heroVariant === "editorial" ? <HeroSectionEditorial snapshot={snapshot} /> : null}
          {template.heroVariant === "split" ? <HeroSectionSplit snapshot={snapshot} /> : null}
          {template.heroVariant === "cinematic" ? <HeroSectionCinematic snapshot={snapshot} /> : null}
          {template.heroVariant === "celebration" ? <HeroSectionCelebration snapshot={snapshot} /> : null}
          {template.heroVariant === "classic" ? <HeroSectionClassic snapshot={snapshot} /> : null}
        </div>
      </div>
    </section>
  );
}

export function StorySection({
  milestones,
  condensed = false,
}: {
  milestones: SiteSnapshot["storyMilestones"];
  condensed?: boolean;
}) {
  const items = condensed ? milestones.slice(0, 4) : milestones;

  if (!items.length) {
    return <EmptyState title="Story coming soon" description="The couple will share their milestones here soon." />;
  }

  return (
    <section className="section-shell mt-24">
      <SectionHeading
        eyebrow="Our Story"
        title="A timeline of moments that shaped the journey."
        description="From the first hello to the wedding countdown: every chapter of their story, beautifully told."
      />
      <div className="mt-10 grid gap-6">
        {items.map((milestone, index) => (
          <Card key={milestone.id} className={cn("overflow-hidden p-0", milestone.imageUrl ? "" : "border-[color:var(--accent)]/14")}>
            <div className={cn("grid", milestone.imageUrl ? "lg:grid-cols-[0.78fr_1.22fr]" : "")}>
              {milestone.imageUrl ? (
                <Image
                  src={milestone.imageUrl}
                  alt={milestone.title}
                  width={1200}
                  height={900}
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="h-full min-h-[18rem] w-full object-cover object-top"
                />
              ) : null}
              <div className="relative p-6 sm:p-8 lg:p-10">
                <div className="absolute right-6 top-4 font-display text-6xl leading-none text-[color:var(--accent)]/18 sm:text-7xl">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <div className="relative max-w-2xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
                    {milestone.shortLabel ?? `Chapter ${index + 1}`}
                  </p>
                  <h3 className="mt-4 font-display text-4xl text-[color:var(--text)] sm:text-5xl">{milestone.title}</h3>
                  <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-[color:var(--accent)]/10 px-4 py-2 text-sm font-medium text-[color:var(--primary)]">
                    <Heart className="h-4 w-4" />
                    {milestone.eventDateLabel}
                  </p>
                  <p className="mt-5 text-sm leading-8 text-[color:var(--muted)] sm:text-base">{milestone.description}</p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}

export function EventsSection({
  events,
  slug,
  condensed = false,
}: {
  events: SiteSnapshot["events"];
  slug: string;
  condensed?: boolean;
}) {
  const items = condensed ? events.slice(0, 3) : events;

  if (!items.length) {
    return <EmptyState title="Events coming soon" description="Event details will be shared here soon." />;
  }

  return (
    <section className="section-shell mt-24">
      <SectionHeading
        eyebrow="Event Details"
        title="Every celebration, clearly planned and beautifully presented."
        description="Each event includes timing, location, dress code, guidance, and invitation rules."
      />
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {items.map((event, index) => (
          <Card
            key={event.id}
            className={cn(
              "overflow-hidden p-0",
              index === 0 ? "lg:col-span-2" : "",
            )}
          >
            <div
              className={cn(
                "grid items-start",
                index === 0 ? "lg:grid-cols-[1.05fr_0.95fr]" : "",
              )}
            >
              <div className="relative">
                {event.imageUrl ? (
                  <Image
                    src={event.imageUrl}
                    alt={event.title}
                    width={1400}
                    height={920}
                    sizes={index === 0 ? "(max-width: 1024px) 100vw, 55vw" : "(max-width: 1024px) 100vw, 50vw"}
                    // Aspect ratio (not h-full) prevents the image from being
                    // stretched to match a tall right-column text block and
                    // then over-zoomed by object-cover. object-top keeps faces
                    // (which live at the top of wedding photos) in frame even
                    // when there's some vertical cropping.
                    className={cn(
                      "w-full object-cover object-top",
                      index === 0 ? "aspect-[5/4]" : "h-64",
                    )}
                  />
                ) : (
                  <div
                    className={cn(
                      "bg-hero-mesh",
                      index === 0 ? "aspect-[5/4]" : "h-64",
                    )}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 flex flex-wrap gap-2">
                  <Badge>{event.dayLabel}</Badge>
                  <Badge className="bg-white/90 text-[color:var(--text)]">
                    {formatEnumLabel(event.audience, "ALL GUESTS")}
                  </Badge>
                </div>
              </div>

              <div className="space-y-5 p-6 sm:p-8">
                <div>
                  <h3 className="font-display text-4xl text-[color:var(--text)]">{event.title}</h3>
                  {event.subtitle ? <p className="mt-3 text-base text-[color:var(--muted)]">{event.subtitle}</p> : null}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className={glassPanel("px-4 py-4")}>
                    <p className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--muted)]">When</p>
                    <p className="mt-3 font-semibold text-[color:var(--text)]">{formatDate(event.startDateTime)}</p>
                    <p className="mt-1 text-sm text-[color:var(--muted)]">{formatTimeRange(event.startDateTime, event.endDateTime)}</p>
                  </div>
                  <div className={glassPanel("px-4 py-4")}>
                    <p className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--muted)]">Where</p>
                    <p className="mt-3 font-semibold text-[color:var(--text)]">{event.locationName}</p>
                    <p className="mt-1 text-sm text-[color:var(--muted)]">{event.fullAddress}</p>
                  </div>
                </div>

                <p className="text-sm leading-8 text-[color:var(--muted)]">{event.description}</p>

                {event.dressCode ? (
                  <div className="rounded-[calc(var(--radius)-0.45rem)] bg-[color:var(--accent)]/10 px-5 py-4 text-sm text-[color:var(--text)]">
                    <span className="font-semibold text-[color:var(--primary)]">Dress code:</span> {event.dressCode}
                  </div>
                ) : null}

                {event.notes ? <p className="text-sm leading-7 text-[color:var(--muted)]">{event.notes}</p> : null}

                {event.contactName ? (
                  <p className="text-sm text-[color:var(--muted)]">
                    Contact: <span className="font-semibold text-[color:var(--text)]">{event.contactName}</span>
                    {event.contactPhone ? ` · ${event.contactPhone}` : ""}
                  </p>
                ) : null}

                <div className="flex flex-wrap gap-3">
                  {event.googleMapsUrl ? (
                    <Button asChild variant="outline" size="sm">
                      <a href={event.googleMapsUrl} target="_blank" rel="noreferrer">
                        View Map
                      </a>
                    </Button>
                  ) : null}
                  <Button asChild size="sm">
                    <Link href={`/${slug}/rsvp` as Route}>RSVP to this event</Link>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}

export function ScheduleSection({ items }: { items: SiteSnapshot["scheduleItems"] }) {
  if (!items.length) {
    return <EmptyState title="Schedule coming soon" description="The day-by-day itinerary will appear here once published." />;
  }

  const grouped = groupBy(items, (item) => item.dayLabel);

  return (
    <section className="section-shell mt-24">
      <SectionHeading
        eyebrow="Itinerary"
        title="A guest-friendly schedule for every day and every event."
        description="Everything you need to stay in step, from the first event of the day to the final farewell."
      />
      <div className="mt-10 grid gap-6">
        {Object.entries(grouped).map(([day, entries]) => (
          <Card key={day} className="overflow-hidden p-0">
            <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[0.34fr_0.66fr]">
              <div className="rounded-[calc(var(--radius)-0.45rem)] bg-[color:var(--accent)]/10 p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-[color:var(--primary)]">Day overview</p>
                <h3 className="mt-4 font-display text-4xl text-[color:var(--text)]">{day}</h3>
                <p className="mt-4 text-sm leading-7 text-[color:var(--muted)]">
                  {entries.length} scheduled {entries.length === 1 ? "moment" : "moments"}. Keep this handy throughout the day.
                </p>
              </div>
              <div className="space-y-4">
                {entries.map((item) => (
                  <div
                    key={item.id}
                    className="grid gap-4 rounded-[calc(var(--radius)-0.55rem)] border border-[color:var(--accent)]/12 bg-white/68 px-5 py-5 sm:grid-cols-[9rem_1fr]"
                  >
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--muted)]">{item.category}</p>
                      <p className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--primary)]">
                        <Clock3 className="h-4 w-4" />
                        {formatTimeRange(item.startDateTime, item.endDateTime)}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-display text-3xl text-[color:var(--text)]">{item.title}</h4>
                      {item.locationName ? (
                        <p className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-[color:var(--primary)]">
                          <MapPin className="h-4 w-4" />
                          {item.locationName}
                        </p>
                      ) : null}
                      {item.description ? <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">{item.description}</p> : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}

export function TidbitsSection({ items }: { items: SiteSnapshot["tidbits"] }) {
  if (!items.length) {
    return <EmptyState title="Tidbits coming soon" description="Helpful details and couple favourites will appear here soon." />;
  }

  return (
    <section className="section-shell mt-24">
      <SectionHeading
        eyebrow="Tidbits"
        title="Helpful details, traditions, and favourite little things."
        description="Little details, favourite things, and everything worth knowing before you celebrate with us."
      />
      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <Card key={item.id} className="relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[color:var(--accent)] to-[color:var(--primary)]" />
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">{item.category}</p>
            <h3 className="mt-5 font-display text-4xl text-[color:var(--text)]">{item.title}</h3>
            <p className="mt-4 text-sm leading-8 text-[color:var(--muted)]">{item.body}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}

export function DressCodeSection({ guides }: { guides: SiteSnapshot["dressCodeGuides"] }) {
  if (!guides.length) {
    return <EmptyState title="Dress code coming soon" description="Styling guidance for each event will be shared here." />;
  }

  return (
    <section className="section-shell mt-24">
      <SectionHeading
        eyebrow="Dress Code"
        title="Styling guidance by event, with colour inspiration."
        description="Colour palettes and styling cues to help you feel perfectly dressed for each part of the celebration."
      />
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {guides.map((guide) => (
          <Card key={guide.id} className="overflow-hidden p-0">
            <div className="grid lg:grid-cols-[0.48fr_0.52fr]">
              {guide.inspirationImage ? (
                <Image
                  src={guide.inspirationImage}
                  alt={guide.title}
                  width={1200}
                  height={960}
                  sizes="(max-width: 1024px) 100vw, 25vw"
                  className="h-full min-h-[18rem] w-full object-cover object-top"
                />
              ) : (
                <div className="min-h-[18rem] bg-hero-mesh" />
              )}
              <div className="space-y-5 p-6 sm:p-8">
                {guide.eventTitle ? <Badge>{guide.eventTitle}</Badge> : null}
                <h3 className="font-display text-4xl text-[color:var(--text)]">{guide.title}</h3>
                <p className="text-sm leading-8 text-[color:var(--muted)]">{guide.guidance}</p>
                {guide.palette.length ? (
                  <div className="flex flex-wrap items-center gap-2.5">
                    {guide.palette.map((color) => (
                      // Guests just need to see the colour — the hex is kept
                      // as a hover tooltip (title) for anyone curious, not as
                      // on-screen text.
                      <span
                        key={color}
                        title={color}
                        aria-label={`Palette colour ${color}`}
                        className="h-9 w-9 rounded-full border border-black/10 shadow-sm ring-2 ring-white/70"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}

export function ExperienceSection({
  items,
  faqItems,
}: {
  items: SiteSnapshot["travelGuideItems"];
  faqItems: SiteSnapshot["faqItems"];
}) {
  if (!items.length && !faqItems.length) {
    return <EmptyState title="Guest experience coming soon" description="Travel tips, FAQs, and guest guidance will appear here." />;
  }

  const grouped = groupBy(items, (item) => item.category);

  return (
    <section className="section-shell mt-24">
      <SectionHeading
        eyebrow="Guest Experience"
        title="Travel, stay, move around, and feel looked after."
        description="Everything you need before you arrive: where to stay, how to get around, and what to expect."
      />
      <div className="mt-10 grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="space-y-6">
          {Object.entries(grouped).map(([category, entries]) => (
            <Card key={category} className="overflow-hidden p-0">
              <div className="border-b border-[color:var(--accent)]/12 bg-[color:var(--accent)]/8 px-6 py-5 sm:px-8">
                <h3 className="font-display text-4xl text-[color:var(--text)]">
                  {formatEnumLabel(category, "Guest Guide")}
                </h3>
              </div>
              <div className="grid gap-4 p-6 sm:p-8">
                {entries.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-[calc(var(--radius)-0.55rem)] border border-[color:var(--accent)]/12 bg-white/68 px-5 py-5"
                  >
                    <h4 className="text-lg font-semibold text-[color:var(--text)]">{item.title}</h4>
                    <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">{item.description}</p>
                    {item.url ? (
                      <Button asChild variant="outline" size="sm" className="mt-4">
                        <a href={item.url} target="_blank" rel="noreferrer">
                          Learn more
                        </a>
                      </Button>
                    ) : null}
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        <div className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          <Card className="overflow-hidden p-0">
            <div className="border-b border-[color:var(--accent)]/12 bg-[color:var(--accent)]/8 px-6 py-5 sm:px-8">
              <p className="text-xs uppercase tracking-[0.22em] text-[color:var(--primary)]">FAQ</p>
              <h3 className="mt-3 font-display text-4xl text-[color:var(--text)]">Questions guests actually ask</h3>
            </div>
            <div className="divide-y divide-[color:var(--accent)]/10 px-6 py-2 sm:px-8">
              {faqItems.map((item) => (
                <details key={item.id} className="group py-4">
                  <summary className="cursor-pointer list-none font-medium text-[color:var(--text)]">
                    {item.question}
                  </summary>
                  <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">{item.answer}</p>
                </details>
              ))}
            </div>
          </Card>

          <div className={glassPanel("px-5 py-5")}>
            <p className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--muted)]">Guest note</p>
            <p className="mt-3 text-lg font-semibold text-[color:var(--text)]">
              Bring this page with you. It is designed to work like a beautiful, pocket-sized weekend concierge.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function GallerySection({
  assets,
  condensed = false,
}: {
  assets: SiteSnapshot["mediaAssets"];
  condensed?: boolean;
}) {
  const gallery = assets.filter((asset) => asset.category === "GALLERY");
  // The spotlight is cinematic — too few frames feel awkward, but capping
  // condensed at 8 keeps the homepage scan-friendly.
  const items = condensed ? gallery.slice(0, 8) : gallery;

  if (!items.length) {
    return <EmptyState title="Gallery is empty" description="Images will appear here once media has been added." />;
  }

  return (
    <section className="section-shell mt-24">
      <SectionHeading
        eyebrow="Gallery"
        title="A cinematic editorial spotlight, one frame at a time."
        description="Tap, swipe, or use arrow keys to move through the highlights."
      />
      <div className="mt-10">
        <GallerySpotlight
          assets={items.map((asset) => ({
            id: asset.id,
            url: asset.url,
            title: asset.title,
            caption: asset.caption,
            altText: asset.altText,
          }))}
        />
      </div>
    </section>
  );
}

export function VideoSection({ videos }: { videos: SiteSnapshot["embeddedVideos"] }) {
  if (!videos.length) {
    return <EmptyState title="Videos coming soon" description="Validated YouTube embeds will appear here once added." />;
  }

  return (
    <section className="section-shell mt-24">
      <SectionHeading
        eyebrow="Videos"
        title="From invitation teasers to full ceremony highlights."
        description="Invitation teasers, ceremony highlights, and behind-the-scenes moments from the celebration."
      />
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {videos.map((video) => (
          <Card key={video.id} className="overflow-hidden p-0">
            <div className="relative aspect-video w-full bg-black">
              <iframe
                src={getYoutubeEmbedUrl(video.youtubeId)}
                title={video.title}
                loading="lazy"
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/28 to-transparent" />
            </div>
            <div className="flex flex-col gap-4 p-6 sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-[color:var(--primary)]">
                  <PlayCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">{video.typeLabel}</span>
                </div>
                <span className="inline-flex items-center gap-1 text-sm text-[color:var(--muted)]">
                  Watch
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>
              <h3 className="font-display text-4xl text-[color:var(--text)]">{video.title}</h3>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
