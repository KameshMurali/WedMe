"use client";

import { useLinkStatus } from "next/link";
import { Loader2 } from "lucide-react";

// Renders a small spinner while the enclosing <Link> navigation is pending.
// Must be used as a descendant of next/link's <Link> — that's the hook's contract.
export function LinkPendingSpinner({ className }: { className?: string }) {
  const { pending } = useLinkStatus();
  if (!pending) return null;
  return <Loader2 aria-label="Loading" className={`h-4 w-4 animate-spin ${className ?? ""}`} />;
}
