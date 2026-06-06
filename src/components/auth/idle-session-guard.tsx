"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { extendSessionAction, logoutAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";

const ACTIVITY_EVENTS = [
  "mousedown",
  "mousemove",
  "keydown",
  "touchstart",
  "scroll",
  "wheel",
  "click",
] as const;

type IdleSessionGuardProps = {
  /** Seconds of inactivity before the warning modal shows. Default: 300 (5 min). */
  idleMs?: number;
  /** Seconds to auto-logout after the modal shows. Default: 60. */
  graceMs?: number;
};

export function IdleSessionGuard({
  idleMs = 5 * 60 * 1000,
  graceMs = 60 * 1000,
}: IdleSessionGuardProps) {
  const router = useRouter();
  const [warningOpen, setWarningOpen] = useState(false);
  const [remainingSec, setRemainingSec] = useState(Math.ceil(graceMs / 1000));
  const [busy, setBusy] = useState<"extend" | "logout" | null>(null);

  const idleTimerRef = useRef<number | null>(null);
  const graceTimerRef = useRef<number | null>(null);
  const countdownTimerRef = useRef<number | null>(null);

  const clearAll = useCallback(() => {
    if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
    if (graceTimerRef.current) window.clearTimeout(graceTimerRef.current);
    if (countdownTimerRef.current) window.clearInterval(countdownTimerRef.current);
    idleTimerRef.current = null;
    graceTimerRef.current = null;
    countdownTimerRef.current = null;
  }, []);

  const performLogout = useCallback(async () => {
    clearAll();
    try {
      // logoutAction redirects to /login, which throws NEXT_REDIRECT — that's
      // expected; let it propagate so the navigation happens.
      await logoutAction();
    } catch {
      // Fallback if redirect doesn't take effect for any reason.
      router.replace("/login");
    }
  }, [clearAll, router]);

  const startGraceCountdown = useCallback(() => {
    setRemainingSec(Math.ceil(graceMs / 1000));
    setWarningOpen(true);

    countdownTimerRef.current = window.setInterval(() => {
      setRemainingSec((s) => Math.max(0, s - 1));
    }, 1000);

    graceTimerRef.current = window.setTimeout(() => {
      void performLogout();
    }, graceMs);
  }, [graceMs, performLogout]);

  const armIdleTimer = useCallback(() => {
    if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
    idleTimerRef.current = window.setTimeout(() => {
      startGraceCountdown();
    }, idleMs);
  }, [idleMs, startGraceCountdown]);

  const handleActivity = useCallback(() => {
    // Activity only resets the idle countdown when the warning is NOT open.
    // Once the modal is visible, the user must explicitly choose to stay
    // signed in or sign out — random mouse-jiggle shouldn't auto-extend.
    if (warningOpen) return;
    armIdleTimer();
  }, [armIdleTimer, warningOpen]);

  // Arm the timer on mount and whenever the warning closes.
  useEffect(() => {
    armIdleTimer();
    return clearAll;
  }, [armIdleTimer, clearAll]);

  useEffect(() => {
    const opts: AddEventListenerOptions = { passive: true };
    for (const evt of ACTIVITY_EVENTS) {
      window.addEventListener(evt, handleActivity, opts);
    }
    return () => {
      for (const evt of ACTIVITY_EVENTS) {
        window.removeEventListener(evt, handleActivity, opts);
      }
    };
  }, [handleActivity]);

  async function handleExtend() {
    setBusy("extend");
    try {
      const result = await extendSessionAction();
      if (!result.ok) {
        // Session is already gone server-side — bounce to login.
        toast.error("Your session has already expired. Please sign in again.");
        await performLogout();
        return;
      }
      // Hide the modal, clear grace timer, restart idle clock.
      if (graceTimerRef.current) window.clearTimeout(graceTimerRef.current);
      if (countdownTimerRef.current) window.clearInterval(countdownTimerRef.current);
      graceTimerRef.current = null;
      countdownTimerRef.current = null;
      setWarningOpen(false);
      armIdleTimer();
      toast.success("Session extended.");
      // Refresh server components in case any data needs to revalidate.
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  async function handleSignOut() {
    setBusy("logout");
    await performLogout();
    // performLogout redirects; setBusy(null) is unreachable in practice.
  }

  const minutesIdle = useMemo(() => Math.round(idleMs / 60000), [idleMs]);

  if (!warningOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="idle-session-title"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-md rounded-[1.6rem] border border-white/40 bg-white p-8 shadow-[0_30px_90px_rgba(43,26,24,0.18)]">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
          Session reminder
        </p>
        <h2
          id="idle-session-title"
          className="mt-3 font-display text-3xl text-[color:var(--text)]"
        >
          Are you still there?
        </h2>
        <p className="mt-4 text-sm leading-7 text-[color:var(--muted)]">
          You&apos;ve been inactive for about {minutesIdle} minutes. For your security,
          we&apos;ll sign you out automatically in{" "}
          <span className="font-semibold text-[color:var(--text)]">
            {Math.floor(remainingSec / 60)}:
            {String(remainingSec % 60).padStart(2, "0")}
          </span>
          .
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            onClick={handleExtend}
            disabled={busy !== null}
            className="flex-1"
          >
            {busy === "extend" ? "Extending…" : "Stay signed in"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleSignOut}
            disabled={busy !== null}
            className="flex-1"
          >
            {busy === "logout" ? "Signing out…" : "Sign out now"}
          </Button>
        </div>
      </div>
    </div>
  );
}
