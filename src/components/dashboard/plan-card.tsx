import type { Route } from "next";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { findPlan, type PlanKey } from "@/lib/pricing";

function formatExpiry(date: Date) {
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

// What the couple actually bought, and until when. Paid plans are one-time
// payments, so this is a status line rather than a billing panel — there's no
// renewal to manage and nothing to cancel.
export function PlanCard({
  planKey,
  expiresAt,
}: {
  planKey: PlanKey;
  expiresAt: Date | null;
}) {
  const plan = findPlan(planKey);

  const detail =
    planKey === "forever"
      ? "Yours permanently — no renewal, nothing to cancel."
      : expiresAt
        ? `Your wedding year · through ${formatExpiry(expiresAt)}`
        : plan.tagline;

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
            Your plan
          </p>
          <p className="mt-2 font-display text-3xl text-[color:var(--text)]">{plan.name}</p>
          <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{detail}</p>
        </div>
        {planKey === "hello" ? (
          <Link
            href={"/pricing" as Route}
            className="rounded-full border border-black/10 bg-white/70 px-4 py-2 text-sm font-medium text-[color:var(--text)] transition hover:bg-white"
          >
            See paid plans
          </Link>
        ) : null}
      </div>
    </Card>
  );
}
