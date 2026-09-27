import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Verification link expired · ToNewBeginning",
  // Nothing to index: this page is only ever reached by redirect from a link
  // that did not work.
  robots: { index: false, follow: false },
};

/**
 * Where /verify-email/[token] sends anyone whose link is missing, already used,
 * expired, or unreadable because the database was unreachable.
 *
 * A static segment, so it wins over the [token] dynamic route. Tokens are
 * 64-character hex, so none can ever collide with the literal "expired".
 */
export default function VerifyEmailExpiredPage() {
  return (
    <main className="section-shell flex min-h-screen items-center justify-center py-16">
      <Card className="w-full max-w-lg text-center">
        <h1 className="font-display text-4xl text-[color:var(--text)]">Verification link expired</h1>
        <p className="mt-4 text-sm leading-7 text-[color:var(--muted)]">
          This link is no longer valid. You can still log in and request a fresh verification flow
          later.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href="/login">Go to login</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </Card>
    </main>
  );
}
