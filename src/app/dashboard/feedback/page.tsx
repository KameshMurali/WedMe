import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { requireAdmin } from "@/server/auth/session";
import { getWorkspaceFeedback } from "@/server/repositories/feedback";

export const metadata = { title: "Feedback · Admin" };

const categoryLabels: Record<string, string> = {
  PRAISE: "Praise",
  BUG: "Bug",
  IDEA: "Idea",
  OTHER: "Other",
};

const categoryStyles: Record<string, string> = {
  PRAISE: "bg-emerald-50 text-emerald-900 ring-emerald-200",
  BUG: "bg-rose-50 text-rose-900 ring-rose-200",
  IDEA: "bg-sky-50 text-sky-900 ring-sky-200",
  OTHER: "bg-stone-100 text-stone-700 ring-stone-200",
};

export default async function AdminFeedbackPage() {
  await requireAdmin();
  const rows = await getWorkspaceFeedback();

  const ratings = rows.map((row) => row.rating).filter((rating): rating is number => rating !== null);
  const averageRating = ratings.length
    ? (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1)
    : "—";
  const bugCount = rows.filter((row) => row.category === "BUG").length;
  const ideaCount = rows.filter((row) => row.category === "IDEA").length;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">Admin</p>
        <h1 className="mt-3 font-display text-5xl text-[color:var(--text)]">Workspace feedback</h1>
        <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
          Everything couples send from the &ldquo;Share feedback&rdquo; button in their workspace.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total submissions" value={rows.length} />
        <StatCard label="Average rating" value={averageRating} />
        <StatCard label="Bugs reported" value={bugCount} />
        <StatCard label="Feature ideas" value={ideaCount} />
      </div>

      <Card className="overflow-hidden p-0">
        {rows.length === 0 ? (
          <div className="p-8 text-center text-sm text-[color:var(--muted)]">
            No feedback yet. It will appear here as soon as a couple uses the
            <span className="font-semibold text-[color:var(--text)]"> Share feedback</span> button in
            their workspace.
          </div>
        ) : (
          <div className="divide-y divide-black/5">
            {rows.map((row) => (
              <div key={row.id} className="px-6 py-5">
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
                      categoryStyles[row.category] ?? categoryStyles.OTHER
                    }`}
                  >
                    {categoryLabels[row.category] ?? row.category}
                  </span>
                  {row.rating !== null ? (
                    <span className="text-sm text-amber-600" aria-label={`Rated ${row.rating} out of 5`}>
                      {"★".repeat(row.rating)}
                      <span className="text-stone-300">{"★".repeat(5 - row.rating)}</span>
                    </span>
                  ) : null}
                  <span className="text-xs text-[color:var(--muted)]">
                    {row.userEmail} · /{row.siteSlug} ·{" "}
                    {row.createdAt.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-7 text-[color:var(--text)]">{row.message}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
