"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SubmitButton({
  label,
  loadingLabel,
  className,
}: {
  label: string;
  loadingLabel?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className={cn("relative", className)} disabled={pending} aria-busy={pending}>
      {/* Keep the label in the layout (just hidden) while pending so the button
          width doesn't lurch when the text swaps to the shorter "Saving…", and
          overlay a spinner. Together with the Button base's
          -webkit-tap-highlight-color reset this stops the messy pending state
          on iOS (stuck tap-highlight ghost + width jump). */}
      <span className={pending ? "invisible" : undefined}>{label}</span>
      {pending ? (
        <span className="absolute inset-0 flex items-center justify-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          {loadingLabel ?? "Saving…"}
        </span>
      ) : null}
    </Button>
  );
}
