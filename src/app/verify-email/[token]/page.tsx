import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { prisma } from "@/server/prisma";
import { hashToken } from "@/server/auth/tokens";

export default async function VerifyEmailPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const verificationToken = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash: hashToken(token) },
  });

  let verified = false;

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
    verified = true;
  }

  return (
    <main className="section-shell flex min-h-screen items-center justify-center py-16">
      <Card className="w-full max-w-lg text-center">
        <h1 className="font-display text-4xl text-[color:var(--text)]">
          {verified ? "Email verified" : "Verification link expired"}
        </h1>
        <p className="mt-4 text-sm leading-7 text-[color:var(--muted)]">
          {verified
            ? "Your account is verified and ready to keep building."
            : "This link is no longer valid. You can still log in and request a fresh verification flow later."}
        </p>
        <Button asChild className="mt-8">
          <Link href="/login">Go to login</Link>
        </Button>
      </Card>
    </main>
  );
}
