import type { Route } from "next";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { requireUser } from "@/server/auth/session";
import { getDashboardOverviewForUser, getDashboardSummary } from "@/server/repositories/wedding-site";

export default async function DashboardHomePage() {
  const user = await requireUser();
  const site = await getDashboardOverviewForUser(user.id);
  if (!site) return null;

  const summary = await getDashboardSummary(site.id);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">Overview</p>
        <h1 className="mt-3 font-display text-5xl text-[color:var(--text)]">Dashboard</h1>
        <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
          Track activity, review responses, and keep your draft moving toward publish.
        </p>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="RSVP responses" value={summary.rsvpCount} />
        <StatCard label="Attending guests" value={summary.attendingCount} />
        <StatCard label="Guest uploads" value={summary.uploadCount} />
        <StatCard label="Guest messages" value={summary.messageCount} />
        <StatCard label="Page views" value={summary.pageViews} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="font-display text-3xl text-[color:var(--text)]">Quick links</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              ["/dashboard/templates", "Refresh your visual direction"],
              ["/dashboard/content", "Edit story, tidbits, FAQs, videos"],
              ["/dashboard/events", "Update events and itinerary"],
              ["/dashboard/uploads", "Review pending uploads and wishes"],
            ].map(([href, label]) => (
              <Link
                key={href}
                href={href as Route}
                className="rounded-3xl border border-black/8 bg-white/70 px-4 py-4 text-sm text-[color:var(--muted)] transition hover:bg-white"
              >
                {label}
              </Link>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="font-display text-3xl text-[color:var(--text)]">Recent RSVPs</h2>
          <div className="mt-5 space-y-3">
            {site.rsvpResponses.slice(0, 5).map((response) => (
              <div key={response.id} className="rounded-3xl border border-black/8 bg-white/70 px-4 py-4">
                <p className="font-medium text-[color:var(--text)]">{response.guestName}</p>
                <p className="mt-1 text-sm text-[color:var(--muted)]">
                  {response.status} · {response.attendeeCount} guest(s)
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
