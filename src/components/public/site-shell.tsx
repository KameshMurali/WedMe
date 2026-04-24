import type { Route } from "next";
import Link from "next/link";
import { CalendarDays, MapPin, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SiteActivityTracker } from "@/components/public/site-activity-tracker";
import { findTemplateByKey } from "@/lib/template-registry";
import { cn, formatDate } from "@/lib/utils";
import type { SiteSnapshot } from "@/types";

const navigationConfig = [
  { href: "", label: "Home" },
  { href: "/story", label: "Story" },
  { href: "/events", label: "Events" },
  { href: "/schedule", label: "Schedule" },
  { href: "/rsvp", label: "RSVP" },
  { href: "/gallery", label: "Gallery" },
  { href: "/experience", label: "Guest Experience" },
  { href: "/memories", label: "Memories" },
  { href: "/wishes", label: "Wishes" },
];

function getNavLinkClasses(active: boolean, variant: ReturnType<typeof findTemplateByKey>["navigationVariant"]) {
  if (variant === "underline") {
    return cn(
      "rounded-full px-4 py-2.5 text-sm transition",
      active
        ? "bg-white text-[color:var(--text)] shadow-sm ring-1 ring-[color:var(--accent)]/20"
        : "text-[color:var(--muted)] hover:text-[color:var(--text)]",
    );
  }

  if (variant === "ghost") {
    return cn(
      "rounded-full px-4 py-2.5 text-sm transition",
      active
        ? "bg-[color:var(--text)] text-[color:var(--background)]"
        : "text-[color:var(--muted)] hover:bg-black/5 hover:text-[color:var(--text)]",
    );
  }

  return cn(
    "rounded-full px-4 py-2.5 text-sm transition",
    active
      ? "bg-white text-[color:var(--text)] shadow-sm ring-1 ring-black/5"
      : "text-[color:var(--muted)] hover:bg-white/70 hover:text-[color:var(--text)]",
  );
}

function getShellBackdropClasses(templateKey: string) {
  switch (templateKey) {
    case "floral-romantic":
      return "bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.88),transparent_32%),radial-gradient(circle_at_22%_18%,rgba(217,138,162,0.18),transparent_26%),radial-gradient(circle_at_78%_12%,rgba(255,207,220,0.22),transparent_24%),linear-gradient(180deg,rgba(255,250,252,0.9)_0%,rgba(255,247,250,0.96)_38%,rgba(255,244,248,1)_100%)]";
    case "minimal-luxury":
      return "bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(250,248,244,0.98)_100%),linear-gradient(90deg,rgba(44,36,29,0.03)_1px,transparent_1px),linear-gradient(rgba(44,36,29,0.03)_1px,transparent_1px)] [background-size:auto,52px_52px,52px_52px]";
    case "cinematic-modern":
      return "bg-[radial-gradient(circle_at_top_left,rgba(199,149,89,0.2),transparent_24%),radial-gradient(circle_at_80%_16%,rgba(255,255,255,0.08),transparent_20%),linear-gradient(180deg,#120d16_0%,#17111d_38%,#120d16_100%)]";
    case "traditional-celebration":
      return "bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.82),transparent_28%),radial-gradient(circle_at_78%_18%,rgba(207,122,36,0.16),transparent_26%),radial-gradient(circle_at_18%_12%,rgba(207,122,36,0.12),transparent_24%),linear-gradient(180deg,#fff9f2_0%,#fff5ea_52%,#fffaf6_100%)]";
    default:
      return "bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.9),transparent_28%),radial-gradient(circle_at_78%_16%,rgba(184,140,74,0.14),transparent_24%),linear-gradient(180deg,#fffaf5_0%,#fcf6f0_42%,#fcf8f3_100%)]";
  }
}

function getHeaderPanelClasses(templateKey: string) {
  switch (templateKey) {
    case "cinematic-modern":
      return "border-white/10 bg-[color:var(--surface)]/78 text-[color:var(--text)] shadow-[0_24px_80px_rgba(7,5,12,0.45)]";
    case "minimal-luxury":
      return "border-black/8 bg-white/88 text-[color:var(--text)] shadow-[0_18px_60px_rgba(31,26,23,0.08)]";
    case "traditional-celebration":
      return "border-[color:var(--accent)]/28 bg-[color:var(--surface)]/92 text-[color:var(--text)] shadow-[0_24px_80px_rgba(135,73,28,0.14)]";
    default:
      return "border-white/60 bg-[color:var(--surface)]/82 text-[color:var(--text)] shadow-[0_24px_80px_rgba(46,22,24,0.10)]";
  }
}

function getFooterPanelClasses(templateKey: string) {
  switch (templateKey) {
    case "cinematic-modern":
      return "border-white/10 bg-[linear-gradient(135deg,rgba(32,22,37,0.96),rgba(20,15,24,0.92))]";
    case "traditional-celebration":
      return "border-[color:var(--accent)]/28 bg-[linear-gradient(135deg,rgba(255,253,248,0.96),rgba(255,244,227,0.86))]";
    case "minimal-luxury":
      return "border-black/8 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(246,243,238,0.92))]";
    default:
      return "border-white/60 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(255,248,244,0.88))]";
  }
}

function getNavRailClasses(isDark: boolean) {
  return isDark
    ? "bg-white/8 ring-1 ring-white/10 backdrop-blur"
    : "bg-white/76 ring-1 ring-black/5 shadow-sm backdrop-blur";
}

export function SiteShell({
  snapshot,
  activeHref,
  children,
}: {
  snapshot: SiteSnapshot;
  activeHref?: string;
  children: React.ReactNode;
}) {
  const template = findTemplateByKey(snapshot.theme.templateKey);
  const isDark = template.key === "cinematic-modern";

  return (
    <div
      style={
        {
          "--background": snapshot.theme.backgroundColor,
          "--surface": snapshot.theme.surfaceColor,
          "--text": snapshot.theme.textColor,
          "--muted": snapshot.theme.mutedColor,
          "--primary": snapshot.theme.primaryColor,
          "--accent": snapshot.theme.accentColor,
          "--radius": snapshot.theme.borderRadius,
        } as React.CSSProperties
      }
      className="relative min-h-screen overflow-hidden bg-[color:var(--background)]"
    >
      <div className={cn("pointer-events-none absolute inset-0", getShellBackdropClasses(template.key))} />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[32rem] bg-gradient-to-b from-white/25 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-20 h-px bg-gradient-to-r from-transparent via-[color:var(--accent)]/30 to-transparent" />
      <SiteActivityTracker slug={snapshot.site.slug} />

      <header className="sticky top-0 z-30 px-4 pt-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div
            className={cn(
              "relative overflow-hidden rounded-[calc(var(--radius)+0.9rem)] border backdrop-blur-xl",
              getHeaderPanelClasses(template.key),
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-[color:var(--accent)]/10" />
            <div className="relative flex flex-col gap-5 px-5 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-[1.3rem] bg-[color:var(--accent)]/16 text-[color:var(--primary)]">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge>{snapshot.site.brandName}</Badge>
                    <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[color:var(--muted)]">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {formatDate(snapshot.site.weddingDate)}
                    </span>
                  </div>
                  <div>
                    <p className="font-display text-3xl leading-none text-[color:var(--text)] sm:text-4xl">
                      {snapshot.site.coupleNames}
                    </p>
                    <p className="mt-2 inline-flex items-center gap-2 text-sm text-[color:var(--muted)]">
                      <MapPin className="h-4 w-4" />
                      {snapshot.site.locationSummary ?? "A beautifully planned celebration awaits."}
                    </p>
                  </div>
                </div>
              </div>

              <nav className="overflow-x-auto">
                <div className={cn("flex min-w-max items-center gap-2 rounded-full p-1.5", getNavRailClasses(isDark))}>
                  {navigationConfig.map((item) => {
                    const href = `/${snapshot.site.slug}${item.href}` as Route;
                    const active = activeHref === href || (item.href === "" && activeHref === `/${snapshot.site.slug}`);

                    return (
                      <Link
                        key={item.href || "home"}
                        href={href}
                        className={getNavLinkClasses(active, template.navigationVariant)}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </nav>

              <div className="flex items-center gap-3">
                <div className="hidden rounded-full border border-[color:var(--accent)]/18 bg-white/55 px-4 py-2 text-xs uppercase tracking-[0.22em] text-[color:var(--muted)] sm:inline-flex">
                  {snapshot.publish.visibility.replaceAll("_", " ")}
                </div>
                <Button asChild size="sm">
                  <Link href={`/${snapshot.site.slug}/rsvp` as Route}>Reply to Invite</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 pb-24">{children}</div>

      <footer className="relative z-10 pt-6">
        <div className="section-shell pb-10">
          <div
            className={cn(
              "overflow-hidden rounded-[calc(var(--radius)+0.8rem)] border px-6 py-8 sm:px-8 sm:py-10",
              getFooterPanelClasses(template.key),
            )}
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted)]">Wedding website</p>
                <p className="mt-3 font-display text-4xl text-[color:var(--text)] sm:text-5xl">
                  {snapshot.site.brandName}
                </p>
                <p className="mt-4 text-base leading-8 text-[color:var(--muted)]">
                  Crafted for {snapshot.site.coupleNames} with a guided guest experience, polished details, and a
                  celebration-first design system.
                </p>
              </div>
              <div className="grid gap-3 text-sm text-[color:var(--muted)] sm:grid-cols-2">
                <div className="rounded-[1.6rem] border border-[color:var(--accent)]/18 bg-white/35 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">Celebration</p>
                  <p className="mt-2 text-base font-semibold text-[color:var(--text)]">
                    {snapshot.site.locationSummary ?? "Destination to be revealed"}
                  </p>
                </div>
                <div className="rounded-[1.6rem] border border-[color:var(--accent)]/18 bg-white/35 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">Date</p>
                  <p className="mt-2 text-base font-semibold text-[color:var(--text)]">
                    {formatDate(snapshot.site.weddingDate)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
