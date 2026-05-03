import type { Route } from "next";
import Link from "next/link";
import { Eye, LayoutTemplate, PenSquare, Rocket, Settings2 } from "lucide-react";

import { DashboardUnavailableState } from "@/components/admin/dashboard-unavailable-state";
import { SiteShell } from "@/components/public/site-shell";
import {
  DressCodeSection,
  EventsSection,
  ExperienceSection,
  GallerySection,
  HeroSection,
  ScheduleSection,
  StorySection,
  TidbitsSection,
  VideoSection,
} from "@/components/public/sections";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { requireUser } from "@/server/auth/session";
import { getDraftSiteSnapshotForUser } from "@/server/services/site-snapshot";

const previewNotes = [
  {
    title: "Draft-only changes",
    description: "Everything here reflects your latest saved draft, not what guests see publicly today.",
    icon: Eye,
  },
  {
    title: "Theme confidence",
    description: "Preview your current template, typography, palette, and layout choices before publishing.",
    icon: LayoutTemplate,
  },
  {
    title: "Fast editing loop",
    description: "Jump straight back to content, templates, or settings from this preview studio.",
    icon: PenSquare,
  },
];

export default async function DashboardPreviewPage() {
  const user = await requireUser();
  const snapshot = await getDraftSiteSnapshotForUser(user.id);
  if (!snapshot) {
    return (
      <DashboardUnavailableState
        section="Preview"
        title="We couldn't build the draft preview yet."
        description="The live preview is waiting on the latest workspace snapshot. Your session is still valid, so try again after opening another section or refreshing this page."
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl">
          <Badge>Preview Studio</Badge>
          <h1 className="mt-5 font-display text-5xl leading-tight text-[color:var(--text)]">
            Review the draft experience before it goes live.
          </h1>
          <p className="mt-4 text-base leading-8 text-[color:var(--muted)]">
            This preview lets you feel the current guest journey with your active draft theme,
            sections, story flow, and event details in one polished workspace.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href="/dashboard/templates">
              <LayoutTemplate className="h-4 w-4" />
              Edit theme
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/content">
              <PenSquare className="h-4 w-4" />
              Edit content
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/settings">
              <Settings2 className="h-4 w-4" />
              Publish settings
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/${snapshot.site.slug}` as Route} target="_blank">
              <Rocket className="h-4 w-4" />
              Open public URL
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {previewNotes.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title} className="space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[color:var(--accent)]/10">
                <Icon className="h-5 w-5 text-[color:var(--primary)]" />
              </div>
              <div>
                <p className="font-semibold text-[color:var(--text)]">{item.title}</p>
                <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">{item.description}</p>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="grid gap-4 bg-gradient-to-r from-[#f7efe7] via-white to-[#f7efe7] lg:grid-cols-[1.4fr_0.6fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--primary)]">
            Current draft
          </p>
          <h2 className="mt-3 font-display text-4xl text-[color:var(--text)]">{snapshot.site.brandName}</h2>
          <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
            {snapshot.site.coupleNames} · {formatDate(snapshot.site.weddingDate)}
          </p>
        </div>
        <div className="grid gap-3 text-sm text-[color:var(--muted)]">
          <div className="rounded-[1.5rem] bg-white/80 px-4 py-3">
            <span className="font-semibold text-[color:var(--text)]">Template:</span> {snapshot.theme.templateName}
          </div>
          <div className="rounded-[1.5rem] bg-white/80 px-4 py-3">
            <span className="font-semibold text-[color:var(--text)]">Visibility:</span> {snapshot.publish.visibility}
          </div>
          <div className="rounded-[1.5rem] bg-white/80 px-4 py-3">
            <span className="font-semibold text-[color:var(--text)]">Status:</span> {snapshot.publish.status}
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-[#17131b] px-5 py-4 text-white">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#ff6b6b]" />
              <span className="h-3 w-3 rounded-full bg-[#ffd166]" />
              <span className="h-3 w-3 rounded-full bg-[#4ecb71]" />
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
              Draft preview
            </div>
          </div>
          <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/75">
            /{snapshot.site.slug}
          </div>
        </div>
        <div className="max-h-[80vh] overflow-auto bg-[#f6efe8]">
          <SiteShell snapshot={snapshot} activeHref={`/${snapshot.site.slug}`}>
            <div className="section-shell pt-6">
              <div className="rounded-3xl border border-amber-200 bg-amber-50/95 px-5 py-4 text-sm leading-7 text-amber-950">
                You are viewing the latest draft version of the site. Public guests still see the
                published snapshot until you publish from Settings.
              </div>
            </div>
            <HeroSection snapshot={snapshot} />
            <StorySection milestones={snapshot.storyMilestones} condensed />
            <EventsSection events={snapshot.events} slug={snapshot.site.slug} condensed />
            <ScheduleSection items={snapshot.scheduleItems} />
            <TidbitsSection items={snapshot.tidbits} />
            <DressCodeSection guides={snapshot.dressCodeGuides} />
            <ExperienceSection items={snapshot.travelGuideItems} faqItems={snapshot.faqItems} />
            <GallerySection assets={snapshot.mediaAssets} condensed />
            <VideoSection videos={snapshot.embeddedVideos} />
          </SiteShell>
        </div>
      </Card>
    </div>
  );
}
