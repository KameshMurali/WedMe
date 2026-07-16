import type { Route } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, PartyPopper } from "lucide-react";

import { Card } from "@/components/ui/card";
import type { Readiness, ReadinessSeverity } from "@/lib/readiness";
import { cn } from "@/lib/utils";

const severityDot: Record<ReadinessSeverity, string> = {
  critical: "bg-rose-500",
  high: "bg-amber-500",
  nice: "bg-emerald-500",
};

const severityLabel: Record<ReadinessSeverity, string> = {
  critical: "Guests will hit problems",
  high: "Strongly recommended",
  nice: "Nice touch",
};

function ProgressRing({ score }: { score: number }) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const filled = (score / 100) * circumference;

  return (
    <div className="relative h-24 w-24 flex-none" role="img" aria-label={`Site is ${score}% guest-ready`}>
      <svg viewBox="0 0 80 80" className="h-24 w-24 -rotate-90">
        <circle cx="40" cy="40" r={radius} fill="none" strokeWidth="7" className="stroke-black/8" />
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference - filled}`}
          className="stroke-[color:var(--primary)] transition-all duration-700"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xl font-semibold text-[color:var(--text)]">
        {score}%
      </span>
    </div>
  );
}

export function ReadinessCard({ readiness }: { readiness: Readiness }) {
  const pending = readiness.items.filter((item) => !item.done);
  const done = readiness.items.filter((item) => item.done);
  const complete = pending.length === 0;

  return (
    <Card>
      <div className="flex flex-wrap items-center gap-5">
        <ProgressRing score={readiness.score} />
        <div className="min-w-[14rem] flex-1">
          {complete ? (
            <>
              <h2 className="flex items-center gap-2 font-display text-3xl text-[color:var(--text)]">
                Your site is guest-ready <PartyPopper className="h-6 w-6 text-[color:var(--primary)]" />
              </h2>
              <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">
                Every readiness check passes. Share your link with confidence, and keep an eye on
                RSVPs as they roll in.
              </p>
            </>
          ) : (
            <>
              <h2 className="font-display text-3xl text-[color:var(--text)]">
                Your site is {readiness.score}% guest-ready
              </h2>
              <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">
                {pending.length} {pending.length === 1 ? "step" : "steps"} left before guests get the
                full experience. Tap one to jump straight to it.
              </p>
            </>
          )}
        </div>
      </div>

      {pending.length > 0 ? (
        <div className="mt-6 space-y-3">
          {pending.map((item) => (
            <Link
              key={item.key}
              href={item.href as Route}
              className="group flex items-center gap-4 rounded-3xl border border-black/8 bg-white/70 px-4 py-4 transition hover:bg-white"
            >
              <span
                className={cn("h-2.5 w-2.5 flex-none rounded-full", severityDot[item.severity])}
                aria-hidden="true"
              />
              <span className="flex-1">
                <span className="block text-sm font-medium text-[color:var(--text)]">{item.label}</span>
                <span className="mt-0.5 block text-xs text-[color:var(--muted)]">
                  {severityLabel[item.severity]} · {item.description}
                </span>
              </span>
              <ArrowRight className="h-4 w-4 flex-none text-[color:var(--muted)] transition group-hover:translate-x-0.5 group-hover:text-[color:var(--text)]" />
            </Link>
          ))}
        </div>
      ) : null}

      {done.length > 0 ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {done.map((item) => (
            <span
              key={item.key}
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-900 ring-1 ring-emerald-200"
            >
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
              {item.label}
            </span>
          ))}
        </div>
      ) : null}
    </Card>
  );
}
