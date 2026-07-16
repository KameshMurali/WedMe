import type { Metadata } from "next";
import Link from "next/link";

import { LoginForm } from "@/components/forms/login-form";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Sign in — ToNewBeginning",
  description: "Sign in to your ToNewBeginning.com account to manage your wedding website, update content, track RSVPs, and control your couple dashboard.",
  alternates: { canonical: "/login" },
};

export default function LoginPage() {
  return (
    <>
    <main className="section-shell flex min-h-screen items-center py-16">
      <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex items-center">
          <div className="max-w-xl">
            <Badge>Couple Dashboard</Badge>
            <h1 className="mt-5 font-display text-5xl leading-tight text-ink sm:text-6xl">
              Step back into your wedding workspace.
            </h1>
            <p className="mt-6 text-base leading-8 text-stone-600">
              Manage your site, update events, review RSVPs, and publish changes without touching code.
            </p>
          </div>
        </div>
        <Card className="mx-auto w-full max-w-xl">
          <h2 className="font-display text-4xl text-[color:var(--text)]">Log in</h2>
          <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
            Secure email and password access for couples and admins.
          </p>
          <div className="mt-8">
            <LoginForm />
          </div>
          <div className="mt-6 text-sm text-stone-500">
            <Link href="/" className="hover:text-stone-900">
              ← Back to home
            </Link>
          </div>
          <p className="mt-6 text-center text-xs text-stone-400">
            Need help?{" "}
            <a href="mailto:hello@tonewbeginning.com" className="underline hover:text-stone-600">
              hello@tonewbeginning.com
            </a>
          </p>
        </Card>
      </div>
    </main>
    <MarketingFooter />
    </>
  );
}
