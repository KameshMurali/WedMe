import { Download } from "lucide-react";

import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { requireAdmin } from "@/server/auth/session";
import { getWaitlistSignups, summarizeWaitlist } from "@/server/repositories/waitlist";

export const metadata = { title: "Waitlist · Admin" };

function planLabel(key: string) {
  return key.charAt(0).toUpperCase() + key.slice(1);
}

export default async function AdminWaitlistPage() {
  await requireAdmin();
  const rows = await getWaitlistSignups();
  const summary = summarizeWaitlist(rows);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">Admin</p>
          <h1 className="mt-3 font-display text-5xl text-[color:var(--text)]">Founding-couple waitlist</h1>
          <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
            Everyone who asked to be notified when paid plans launch. Use this to gauge demand per tier and
            region before wiring Checkout.
          </p>
        </div>
        <a
          href="/api/dashboard/waitlist/export"
          className="inline-flex items-center gap-2 rounded-full bg-[color:var(--primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:bg-[color:var(--accent)]"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </a>
      </div>

      {/* Summary tiles */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total signups" value={summary.total} />
        <StatCard label="Together interest" value={summary.byPlan.together ?? 0} />
        <StatCard label="Forever interest" value={summary.byPlan.forever ?? 0} />
        <StatCard
          label="Top region"
          value={
            Object.entries(summary.byCurrency).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—"
          }
        />
      </div>

      {/* Table */}
      <Card className="overflow-hidden p-0">
        {rows.length === 0 ? (
          <div className="p-8 text-center text-sm text-[color:var(--muted)]">
            No signups yet. Share <span className="font-semibold text-[color:var(--text)]">/pricing</span> to start
            collecting founding couples.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-black/8 text-left text-xs uppercase tracking-[0.16em] text-[color:var(--muted)]">
                  <th className="px-5 py-4 font-semibold">Email</th>
                  <th className="px-5 py-4 font-semibold">Plan</th>
                  <th className="px-5 py-4 font-semibold">Currency</th>
                  <th className="px-5 py-4 font-semibold">Source</th>
                  <th className="px-5 py-4 font-semibold">Joined</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-black/5 last:border-0">
                    <td className="px-5 py-4 font-medium text-[color:var(--text)]">{row.email}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-full bg-[color:var(--accent)]/14 px-3 py-1 text-xs font-semibold text-[color:var(--primary)]">
                        {planLabel(row.planKey)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[color:var(--muted)]">{row.currency}</td>
                    <td className="px-5 py-4 text-[color:var(--muted)]">{row.source ?? "—"}</td>
                    <td className="px-5 py-4 text-[color:var(--muted)]">
                      {row.createdAt.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
