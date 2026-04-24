import { RegisterForm } from "@/components/forms/register-form";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export default function RegisterPage() {
  return (
    <main className="section-shell flex min-h-screen items-center py-16">
      <div className="grid w-full gap-8 lg:grid-cols-[1fr_1fr]">
        <div className="flex items-center">
          <div className="max-w-xl">
            <Badge>Create Your Workspace</Badge>
            <h1 className="mt-5 font-display text-5xl leading-tight text-ink sm:text-6xl">
              Launch a wedding website that feels like a premium product.
            </h1>
            <p className="mt-6 text-base leading-8 text-stone-600">
              Set up your couple dashboard, choose a custom URL, and start shaping your wedding story.
            </p>
          </div>
        </div>
        <Card className="mx-auto w-full max-w-2xl">
          <h2 className="font-display text-4xl text-[color:var(--text)]">Create account</h2>
          <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
            We’ll create your site in draft mode so you can customise everything before publishing.
          </p>
          <div className="mt-8">
            <RegisterForm />
          </div>
        </Card>
      </div>
    </main>
  );
}
