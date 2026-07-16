import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { setSessionCookie } from "@/server/auth/session";
import { hashToken } from "@/server/auth/tokens";
import { prisma } from "@/server/prisma";

export const metadata: Metadata = {
  title: "Email verified · ToNewBeginning",
};

export default async function VerifyEmailPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const verificationToken = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });

  if (verificationToken && !verificationToken.usedAt && verificationToken.expiresAt > new Date()) {
    await prisma.$transaction([
      prisma.emailVerificationToken.update({
        where: { id: verificationToken.id },
        data: { usedAt: new Date() },
      }),
      prisma.user.update({
        where: { id: verificationToken.userId },
        data: { emailVerifiedAt: new Date() },
      }),
    ]);

    // Sign the user in and send them straight to the dashboard.
    await setSessionCookie({
      userId: verificationToken.user.id,
      email: verificationToken.user.email,
      role: verificationToken.user.role,
    });
    redirect("/dashboard");
  }

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
