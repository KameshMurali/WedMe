"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Eye, LogOut, Palette, PenSquare, Settings, Sparkles, UploadCloud, Users } from "lucide-react";

import { logoutAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
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
  children,
}: {
  site: {
    brandName: string;
    slug: string;
    coupleNames: string;
    status: string;
  };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isPublished = site.status === "PUBLISHED";

  useEffect(() => {
    if (!dashboardRoutes.includes(pathname as (typeof dashboardRoutes)[number])) return;

    document.cookie = `${workspaceResumeCookieName}=${encodeURIComponent(pathname)}; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax`;
  }, [pathname]);

  return (
    <main className="section-shell py-8">
      <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="space-y-6">
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
            {navigation.map((item) => {
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
            <form action={logoutAction}>
              <Button variant="ghost" className="w-full justify-start">
                <LogOut className="h-4 w-4" />
                Log out
              </Button>
            </form>
          </Card>
        </aside>
        <section>{children}</section>
      </div>
    </main>
  );
}
