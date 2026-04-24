import { LoginForm } from "@/components/forms/login-form";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
  return (
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
        </Card>
      </div>
    </main>
  );
}
