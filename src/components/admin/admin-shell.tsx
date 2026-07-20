"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { Eye, Home, Inbox, ListChecks, LogOut, Palette, PenSquare, Settings, Sparkles, UploadCloud, Users } from "lucide-react";

import { logoutAction } from "@/actions/auth";
import { FeedbackDialog } from "@/components/admin/feedback-dialog";
import { Button } from "@/components/ui/button";
import { LinkPendingSpinner } from "@/components/ui/link-pending-spinner";
import { Card } from "@/components/ui/card";
import { dashboardRoutes, workspaceResumeCookieName } from "@/lib/constants";
import { cn } from "@/lib/utils";

const navigation: Array<{ href: Route; label: string; icon: typeof Sparkles }> = [
  { href: "/dashboard", label: "Overview", icon: Sparkles },
  { href: "/dashboard/templates", label: "Templates", icon: Palette },
  { href: "/dashboard/content", label: "Content", icon: PenSquare },
  { href: "/dashboard/events", label: "Events", icon: PenSquare },
  { href: "/dashboard/rsvps", label: "RSVPs", icon: Users },
  { href: "/dashboard/uploads", label: "Moderation", icon: UploadCloud },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/dashboard/preview", label: "Preview", icon: Eye },
];

export function AdminShell({
  site,
  isAdmin = false,
  children,
}: {
  site: {
    brandName: string;
    slug: string;
    coupleNames: string;
    status: string;
  };
  isAdmin?: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isPublished = site.status === "PUBLISHED";
  const mobilePillRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  // Keep the active pill centered in the mobile nav rail so users always
  // see where they are (and that there's more to scroll).
  useEffect(() => {
    mobilePillRefs.current[pathname]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [pathname]);

  // Admin-only nav additions, appended after the standard couple navigation.
  const navItems = isAdmin
    ? [
        ...navigation,
        { href: "/dashboard/waitlist" as Route, label: "Waitlist", icon: ListChecks },
        { href: "/dashboard/feedback" as Route, label: "Feedback", icon: Inbox },
      ]
    : navigation;

  useEffect(() => {
    if (!dashboardRoutes.includes(pathname as (typeof dashboardRoutes)[number])) return;

    document.cookie = `${workspaceResumeCookieName}=${encodeURIComponent(pathname)}; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax`;
  }, [pathname]);

  return (
    <main className="section-shell py-4 xl:py-8">
      {/* Compact sticky top bar — mobile & tablet only. Desktop keeps the sidebar. */}
      <div className="sticky top-2 z-30 mb-6 xl:hidden">
        {/* Solid background on purpose: iOS Safari renders backdrop-filter
            unreliably inside rounded overflow-hidden containers, letting the
            page text bleed through a translucent bar. */}
        <div className="overflow-hidden rounded-3xl border border-black/8 bg-white shadow-[0_12px_40px_rgba(43,26,24,0.16)]">
          <div className="flex items-center justify-between gap-3 px-4 pt-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <p className="truncate font-display text-lg leading-none text-[color:var(--text)]">
                {site.brandName}
              </p>
              <span
                className={cn(
                  "flex-none rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]",
                  isPublished ? "bg-emerald-100 text-emerald-900" : "bg-amber-100 text-amber-900",
                )}
              >
                {isPublished ? "Live" : "Draft"}
              </span>
            </div>
            <div className="flex flex-none items-center">
              <Link
                href={(isPublished ? `/${site.slug}` : "/dashboard/preview") as Route}
                target={isPublished ? "_blank" : undefined}
                aria-label={isPublished ? "View public site" : "Preview draft site"}
                className="rounded-full p-2 text-[color:var(--muted)] transition hover:bg-black/5 hover:text-[color:var(--text)]"
              >
                <Eye className="h-5 w-5" />
              </Link>
              <Link
                href="/"
                aria-label="Back to home"
                className="rounded-full p-2 text-[color:var(--muted)] transition hover:bg-black/5 hover:text-[color:var(--text)]"
              >
                <Home className="h-5 w-5" />
              </Link>
              <FeedbackDialog compact />
              <form action={logoutAction}>
                <button
                  type="submit"
                  aria-label="Log out"
                  className="rounded-full p-2 text-[color:var(--muted)] transition hover:bg-black/5 hover:text-[color:var(--text)]"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </form>
            </div>
          </div>
          <nav aria-label="Dashboard sections" className="overflow-x-auto px-3 pb-3 pt-2 [scrollbar-width:none]">
            <div className="flex min-w-max items-center gap-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    ref={(el) => {
                      mobilePillRefs.current[item.href] = el;
                    }}
                    href={item.href}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition",
                      active
                        ? "bg-[color:var(--primary)] text-white"
                        : "text-[color:var(--muted)] hover:bg-black/5 hover:text-[color:var(--text)]",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                    <LinkPendingSpinner />
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="hidden space-y-6 xl:block">
          <Card className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
                Couple Workspace
              </p>
              <h1 className="mt-3 font-display text-4xl text-[color:var(--text)]">{site.brandName}</h1>
              <p className="mt-2 text-sm text-[color:var(--muted)]">{site.coupleNames}</p>
            </div>
            <div className="rounded-3xl bg-[color:var(--accent)]/10 px-4 py-3 text-sm text-[color:var(--text)]">
              {isPublished ? "Public URL" : "Draft slug"}: /{site.slug}
            </div>
            <div className="rounded-3xl bg-black/5 px-4 py-3 text-sm text-[color:var(--text)]">
              Status: {site.status}
            </div>
            {!isPublished ? (
              <p className="text-xs leading-6 text-[color:var(--muted)]">
                This site is still in draft mode. Guests won&apos;t be able to open{" "}
                <span className="font-medium text-[color:var(--text)]">/{site.slug}</span> until you
                publish it from Settings.
              </p>
            ) : null}
          </Card>
          <Card className="space-y-2 p-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                    active
                      ? "bg-[color:var(--primary)] text-white"
                      : "text-[color:var(--muted)] hover:bg-black/5 hover:text-[color:var(--text)]",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                  <LinkPendingSpinner className="ml-auto" />
                </Link>
              );
            })}
          </Card>
          <Card className="space-y-3">
            <Button asChild variant="outline" className="w-full">
              <Link
                href={(isPublished ? `/${site.slug}` : "/dashboard/preview") as Route}
                target={isPublished ? "_blank" : undefined}
              >
                {isPublished ? "View public site" : "Preview draft site"}
              </Link>
            </Button>
            <Button asChild variant="ghost" className="w-full justify-start">
              <Link href="/">
                <Home className="h-4 w-4" />
                Back to home
              </Link>
            </Button>
            <FeedbackDialog />
            <form action={logoutAction}>
              <Button type="submit" variant="ghost" className="w-full justify-start">
                <LogOut className="h-4 w-4" />
                Log out
              </Button>
            </form>
          </Card>
        </aside>
        {/* min-w-0 lets this grid item shrink to the viewport so wide content
            (e.g. the waitlist table) scrolls inside its own overflow-x-auto
            container instead of stretching the whole page and breaking the
            sticky top bar's width on mobile. */}
        <section className="min-w-0">{children}</section>
      </div>
    </main>
  );
}
