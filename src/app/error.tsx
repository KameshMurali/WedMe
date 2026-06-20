"use client";

import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled app error", error);
  }, [error]);

  return (
    <main className="section-shell flex min-h-screen flex-col items-center justify-center py-24 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">Error</p>
      <h1 className="mt-5 font-display text-5xl leading-tight text-stone-900 sm:text-6xl">
        Something went wrong
      </h1>
      <p className="mt-6 max-w-md text-base leading-8 text-stone-600">
        An unexpected error occurred. You can try again or return to the home page.
      </p>
      {error.digest ? (
        <p className="mt-3 text-xs text-stone-400">Error ID: {error.digest}</p>
      ) : null}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button asChild variant="outline">
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </main>
  );
}
