"use client";

import { useActionState } from "react";
import { CheckCircle2, Lock, Sparkles } from "lucide-react";

import { applyContentPackAction } from "@/actions/dashboard";
import { Button } from "@/components/ui/button";
import { initialActionState } from "@/lib/action-state";
import type { ContentPack } from "@/lib/content-packs";
import { cn } from "@/lib/utils";

// Starter packs prefill the ceremony structure — Mehendi, Nikah, tea ceremony —
// so a couple isn't typing every event from scratch. Applying is additive, so
// this is safe to press even on a site that already has events.
export function ContentPackPicker({
  packs,
  canUsePremium,
}: {
  packs: Pick<ContentPack, "key" | "name" | "tradition" | "description">[];
  // Presentation only. applyContentPackAction re-checks the plan server-side.
  canUsePremium: boolean;
}) {
  const [state, formAction, pending] = useActionState(applyContentPackAction, initialActionState);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-display text-3xl text-[color:var(--text)]">Starter content</h2>
          {!canUsePremium ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
              <Lock className="h-3 w-3" />
              Together
            </span>
          ) : null}
        </div>
        <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
          Add the usual ceremonies for your tradition in one go, then edit the details. Your existing
          events are kept — packs only add.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {packs.map((pack) => (
          <button
            key={pack.key}
            type="submit"
            name="packKey"
            value={pack.key}
            disabled={pending || !canUsePremium}
            className={cn(
              "rounded-3xl border border-black/8 bg-white/70 px-4 py-4 text-left transition",
              canUsePremium ? "hover:bg-white" : "cursor-not-allowed opacity-60",
              pending && "cursor-wait",
            )}
          >
            <p className="font-medium text-[color:var(--text)]">{pack.name}</p>
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
              {pack.tradition}
            </p>
            <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{pack.description}</p>
          </button>
        ))}
      </div>

      {state.error ? (
        <p className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="flex items-start gap-2 rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none" />
          {state.success}
        </p>
      ) : null}

      {!canUsePremium ? (
        <p className="flex items-center gap-2 text-xs text-[color:var(--muted)]">
          <Sparkles className="h-3.5 w-3.5" />
          Starter packs and the cultural designs above are included with Together and Forever.
        </p>
      ) : null}

      {pending ? (
        <Button type="button" variant="outline" disabled>
          Adding events…
        </Button>
      ) : null}
    </form>
  );
}
