"use client";

import Link from "next/link";
import { useSyncExternalStore, useTransition } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { generateAiDraftAction } from "@/actions/ai";
import type { AiDraftKind } from "@/lib/validations/ai";

type AiRemaining = {
  today: number;
  lifetime: number | null; // null = unlimited (paid plan / admin)
};

// Tiny module-level store so every Draft-with-AI button on a page shows the
// same remaining counts: one draft anywhere updates all of them. Seeded from
// the server-passed initial values on first render.
let sharedRemaining: AiRemaining | null = null;
const listeners = new Set<() => void>();

function setSharedRemaining(next: AiRemaining) {
  sharedRemaining = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return sharedRemaining;
}

function getServerSnapshot(): AiRemaining | null {
  return null;
}

export function AiDraftButton({
  kind,
  getHint,
  getContext,
  onDraft,
  initialRemainingToday,
  initialRemainingLifetime,
}: {
  kind: AiDraftKind;
  // Current field text — it doubles as the couple's rough notes for the draft.
  getHint: () => string;
  getContext?: () => { title?: string; question?: string } | undefined;
  onDraft: (text: string) => void;
  initialRemainingToday: number;
  initialRemainingLifetime: number | null;
}) {
  const [isPending, startTransition] = useTransition();
  const shared = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const remainingToday = shared ? shared.today : initialRemainingToday;
  const remainingLifetime = shared ? shared.lifetime : initialRemainingLifetime;

  const lifetimeExhausted = remainingLifetime !== null && remainingLifetime <= 0;
  const dailyExhausted = remainingToday <= 0;
  const disabled = isPending || lifetimeExhausted || dailyExhausted;

  function handleClick() {
    if (disabled) return;
    startTransition(async () => {
      const result = await generateAiDraftAction({
        kind,
        hint: getHint().slice(0, 600),
        context: getContext?.(),
      });

      const nextRemaining: AiRemaining = {
        today: typeof result.remainingToday === "number" ? result.remainingToday : remainingToday,
        lifetime:
          result.remainingLifetime === undefined ? remainingLifetime : result.remainingLifetime,
      };
      setSharedRemaining(nextRemaining);

      if (result.error) {
        toast.error(result.error);
        return;
      }
      if (result.draft) {
        onDraft(result.draft);
        toast.success("Draft added — edit it to make it yours, then save.");
      }
    });
  }

  // Owner-specified copy: always surface how many attempts are left, showing
  // whichever limit is more restrictive (free-tier lifetime teaser vs daily).
  let statusLine: React.ReactNode;
  if (lifetimeExhausted) {
    statusLine = (
      <Link href="/pricing" className="font-semibold text-[color:var(--primary)] hover:underline">
        Free drafts used — upgrade to Together for unlimited
      </Link>
    );
  } else if (dailyExhausted) {
    statusLine = <>Daily limit reached — resets tomorrow</>;
  } else if (remainingLifetime !== null && remainingLifetime < remainingToday) {
    statusLine = <>{remainingLifetime} of 10 free drafts left</>;
  } else {
    statusLine = <>You can attempt {remainingToday} more times today</>;
  }

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--accent)]/40 bg-white/80 px-3 py-1.5 text-xs font-semibold text-[color:var(--primary)] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
        {isPending ? "Drafting…" : "Draft with AI"}
      </button>
      <span className="text-[11px] text-[color:var(--muted)]">{statusLine}</span>
    </span>
  );
}
