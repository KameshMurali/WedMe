import { ForgotPasswordForm } from "@/components/forms/forgot-password-form";
import { Card } from "@/components/ui/card";

export default function ForgotPasswordPage() {
  return (
    <main className="section-shell flex min-h-screen items-center justify-center py-16">
      <Card className="w-full max-w-lg">
        <h1 className="font-display text-4xl text-[color:var(--text)]">Forgot password</h1>
        <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
          Enter your email and we’ll prepare a secure reset link for your dashboard access.
        </p>
        <div className="mt-8">
          <ForgotPasswordForm />
        </div>
      </Card>
    </main>
  );
}
