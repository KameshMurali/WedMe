import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found · ToNewBeginning",
};

export default function NotFound() {
  return (
    <main className="section-shell flex min-h-screen flex-col items-center justify-center py-24 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">404</p>
      <h1 className="mt-5 font-display text-5xl leading-tight text-stone-900 sm:text-6xl">
        Page not found
      </h1>
      <p className="mt-6 max-w-md text-base leading-8 text-stone-600">
        The page you&apos;re looking for doesn&apos;t exist or may have moved. If you typed a wedding
        URL, double-check the spelling.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="/">Back to home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/login">Log in</Link>
        </Button>
      </div>
    </main>
  );
}
