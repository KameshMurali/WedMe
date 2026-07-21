"use client";

import { useEffect, useRef, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { ArrowLeft, CalendarDays, MapPin, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LinkPendingSpinner } from "@/components/ui/link-pending-spinner";
import { findTemplateByKey } from "@/lib/template-registry";
import { cn, formatDate, formatEnumLabel } from "@/lib/utils";

type NavItem = { href: string; label: string; sectionType?: string };

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

function getNavRailClasses(isDark: boolean) {
  return isDark
    ? "bg-white/8 ring-1 ring-white/10 backdrop-blur"
    : "bg-white/76 ring-1 ring-black/5 shadow-sm backdrop-blur";
}

export function SiteHeader({
  templateKey,
  brandName,
  coupleNames,
  weddingDate,
  locationSummary,
  slug,
  visibility,
  visibleNavItems,
  activeHref,
  showBackToPlatformHome,
  isDark,
}: {
  templateKey: string;
  brandName: string;
  coupleNames: string;
  weddingDate: string;
  locationSummary: string | null;
  slug: string;
  visibility: string;
  visibleNavItems: NavItem[];
  activeHref?: string;
  showBackToPlatformHome: boolean;
  isDark: boolean;
}) {
  const template = findTemplateByKey(templateKey);

  // Keep the active section's pill centered in the swipe-scrolled nav rail so
  // guests always land on where they are (and see there's more to scroll),
  // instead of a random slice of the tail. Mirrors the dashboard mobile nav.
  const pillRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  useEffect(() => {
    if (!activeHref) return;
    pillRefs.current[activeHref]?.scrollIntoView({
      inline: "center",
      block: "nearest",
      behavior: "auto",
    });
  }, [activeHref]);

  // On mobile the full header is tall; once the guest scrolls past it we
  // collapse to a slim pinned bar (compact name + nav) so it stops covering
  // the screen. Desktop always renders the full header (lg: overrides below).
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setCollapsed(window.scrollY > 72));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 px-4 pt-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div
          data-collapsed={collapsed ? "true" : "false"}
          className={cn(
            "group relative overflow-hidden rounded-[calc(var(--radius)+0.9rem)] border backdrop-blur-xl",
            getHeaderPanelClasses(template.key),
          )}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-[color:var(--accent)]/10" />
          {showBackToPlatformHome ? (
            <div className="relative border-b border-black/6 px-5 py-3 group-data-[collapsed=true]:hidden sm:px-6 lg:group-data-[collapsed=true]:block">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full border border-[color:var(--accent)]/20 bg-white/70 px-4 py-2 text-sm font-medium text-[color:var(--text)] transition hover:bg-white"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </div>
          ) : null}
          <div className="relative flex flex-col gap-5 px-5 py-4 transition-[padding,gap] duration-300 group-data-[collapsed=true]:gap-3 group-data-[collapsed=true]:py-2 sm:px-6 lg:group-data-[collapsed=true]:gap-5 lg:group-data-[collapsed=true]:py-4">
            {/* Full brand + action row — hidden on mobile once collapsed, always shown on desktop */}
            <div className="flex flex-col gap-5 group-data-[collapsed=true]:hidden lg:flex-row lg:items-center lg:justify-between lg:group-data-[collapsed=true]:flex">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-[1.3rem] bg-[color:var(--accent)]/16 text-[color:var(--primary)]">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge>{brandName}</Badge>
                    <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[color:var(--muted)]">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {formatDate(weddingDate)}
                    </span>
                  </div>
                  <div>
                    <p className="font-display text-3xl leading-none text-[color:var(--text)] sm:text-4xl">
                      {coupleNames}
                    </p>
                    <p className="mt-2 inline-flex items-center gap-2 text-sm text-[color:var(--muted)]">
                      <MapPin className="h-4 w-4" />
                      {locationSummary ?? "A beautifully planned celebration awaits."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <div className="hidden rounded-full border border-[color:var(--accent)]/18 bg-white/55 px-4 py-2 text-xs uppercase tracking-[0.22em] text-[color:var(--muted)] sm:inline-flex">
                  {formatEnumLabel(visibility, "PUBLIC")}
                </div>
                <Button asChild size="sm">
                  <Link href={`/${slug}/rsvp` as Route}>Reply to Invite</Link>
                </Button>
              </div>
            </div>

            {/* Compact name — only when collapsed on mobile; never on desktop */}
            <p className="hidden truncate font-display text-xl leading-none text-[color:var(--text)] group-data-[collapsed=true]:block lg:!hidden">
              {coupleNames}
            </p>

            {/* Nav row: full width so all sections show. Centered on desktop,
                swipe-scrolls on mobile with the scrollbar hidden. Visible in
                both the full and collapsed states. */}
            <nav
              aria-label="Wedding site sections"
              className="no-scrollbar overflow-x-auto px-1 [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)] [-webkit-mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]"
            >
              <div className="flex min-w-max justify-center">
                <div className={cn("flex items-center gap-2 rounded-full p-1.5", getNavRailClasses(isDark))}>
                  {visibleNavItems.map((item) => {
                    const href = `/${slug}${item.href}` as Route;
                    const active = activeHref === href || (item.href === "" && activeHref === `/${slug}`);

                    return (
                      <Link
                        key={item.href || "home"}
                        ref={(el) => {
                          pillRefs.current[href] = el;
                        }}
                        href={href}
                        className={cn("inline-flex items-center gap-2", getNavLinkClasses(active, template.navigationVariant))}
                      >
                        {item.label}
                        <LinkPendingSpinner />
                      </Link>
                    );
                  })}
                </div>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
