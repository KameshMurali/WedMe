import { ResetPasswordForm } from "@/components/forms/reset-password-form";
import { Card } from "@/components/ui/card";

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <main className="section-shell flex min-h-screen items-center justify-center py-16">
      <Card className="w-full max-w-lg">
        <h1 className="font-display text-4xl text-[color:var(--text)]">Reset password</h1>
        <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
          Set a fresh password for your couple dashboard.
        </p>
        <div className="mt-8">
          <ResetPasswordForm token={token} />
        </div>
      </Card>
    </main>
  );
}
