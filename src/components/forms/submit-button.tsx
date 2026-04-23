"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

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
    <Button type="submit" className={className} disabled={pending}>
      {pending ? loadingLabel ?? "Saving..." : label}
    </Button>
  );
}
