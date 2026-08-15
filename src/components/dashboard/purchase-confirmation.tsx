"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";

import type { PlanKey } from "@/lib/pricing";

// Paddle's webhook is asynchronous: the buyer is redirected back the moment the
// payment clears, which can be a second or two BEFORE transaction.completed
// reaches us. So "still on the free tier" right after checkout means "not yet",
// never "it failed" — this component waits rather than reporting either outcome
// prematurely.

const POLL_INTERVAL_MS = 2000;
const MAX_WAIT_MS = 20000;

export function PurchaseConfirmation({
  planKey,
  planName,
  supportEmail,
}: {
  planKey: PlanKey;
  planName: string | null;
  supportEmail: string;
}) {
  const router = useRouter();
  const confirmed = planKey !== "hello";
  const [timedOut, setTimedOut] = useState(false);
  const startedAt = useRef<number | null>(null);

  useEffect(() => {
    if (confirmed) {
      // Drop the query param so a refresh (or the back button) doesn't replay
      // this banner on a workspace that's already been upgraded.
      //
      // history.replaceState, NOT router.replace: the latter re-renders the
      // server component, which would unmount this banner and make the success
      // message flash out of existence the moment it appeared.
      window.history.replaceState(null, "", "/dashboard");
      return;
    }

    if (startedAt.current === null) startedAt.current = Date.now();

    const timer = setInterval(() => {
      if (Date.now() - startedAt.current! >= MAX_WAIT_MS) {
        setTimedOut(true);
        clearInterval(timer);
        return;
      }
      // Re-runs the server component, which re-resolves the plan. As soon as the
      // webhook has landed this flips to the confirmed branch.
      router.refresh();
    }, POLL_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [confirmed, router]);

  if (confirmed) {
    return (
      <div className="flex items-start gap-3 rounded-3xl border border-emerald-200 bg-emerald-50 px-5 py-4">
        <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-emerald-600" />
        <div>
          <p className="font-medium text-emerald-900">
            You&apos;re on {planName ?? "your new plan"}. Thank you.
          </p>
          <p className="mt-1 text-sm text-emerald-800">
            Everything in your plan is unlocked right away — your receipt is on its way by email.
          </p>
        </div>
      </div>
    );
  }

  if (timedOut) {
    // Deliberately not phrased as a failure. The payment succeeded; only our
    // confirmation is late, and Paddle retries until it gets through.
    return (
      <div className="flex items-start gap-3 rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4">
        <Loader2 className="mt-0.5 h-5 w-5 flex-none text-amber-600" />
        <div>
          <p className="font-medium text-amber-900">Your payment went through.</p>
          <p className="mt-1 text-sm text-amber-800">
            Confirming it is taking longer than usual. Your plan will activate on its own — refresh
            in a minute. If it still hasn&apos;t, email{" "}
            <a className="underline" href={`mailto:${supportEmail}`}>
              {supportEmail}
            </a>{" "}
            and we&apos;ll sort it out right away.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 rounded-3xl border border-black/8 bg-white/70 px-5 py-4">
      <Loader2 className="mt-0.5 h-5 w-5 flex-none animate-spin text-[color:var(--primary)]" />
      <div>
        <p className="font-medium text-[color:var(--text)]">Payment received — confirming your plan…</p>
        <p className="mt-1 text-sm text-[color:var(--muted)]">
          This usually takes a couple of seconds. You don&apos;t need to do anything.
        </p>
      </div>
    </div>
  );
}
