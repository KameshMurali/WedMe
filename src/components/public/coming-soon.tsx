import Link from "next/link";
import { CalendarDays, Sparkles } from "lucide-react";

import { Card } from "@/components/ui/card";

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function ComingSoonPage({
  brandName,
  coupleNames,
  weddingDate,
}: {
  brandName: string;
  coupleNames: string;
  weddingDate: Date;
}) {
  return (
    <main className="section-shell flex min-h-screen items-center justify-center py-16">
      <Card className="w-full max-w-xl text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--accent)]/16 text-[color:var(--primary)]">
          <Sparkles className="h-6 w-6" />
        </div>
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
          {brandName}
        </p>
        <h1 className="mt-4 font-display text-5xl text-[color:var(--text)]">
          Something lovely is on the way.
        </h1>
        <p className="mt-5 text-base leading-7 text-[color:var(--muted)]">
          {coupleNames} are putting the finishing touches on their wedding site. Check back here soon.
          This page will fill with their story, schedule, and the details you&apos;ll need to celebrate together.
        </p>
        <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-white/85 px-5 py-3 text-sm text-[color:var(--muted)] ring-1 ring-black/5">
          <CalendarDays className="h-4 w-4" />
          {formatDate(weddingDate)}
        </div>
        <p className="mt-8 text-sm text-[color:var(--muted)]">
          Are you the couple?{" "}
          <Link href="/login" className="font-medium text-[color:var(--text)] hover:underline">
            Log in to publish your site
          </Link>
        </p>
        <p className="mt-3 text-xs text-[color:var(--muted)]">
          <Link href="/" className="hover:text-[color:var(--text)]">
            Crafted with ToNewBeginning.com
          </Link>
        </p>
      </Card>
    </main>
  );
}
