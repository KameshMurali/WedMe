import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type DashboardUnavailableStateProps = {
  section: string;
  title?: string;
  description?: string;
};

export function DashboardUnavailableState({
  section,
  title = "We couldn't load this workspace section yet.",
  description = "The session is still active, but this part of the dashboard needs a moment to reconnect. Try refreshing, or switch to another section and come back.",
}: DashboardUnavailableStateProps) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
          {section}
        </p>
        <h1 className="mt-3 font-display text-5xl text-[color:var(--text)]">Workspace status</h1>
      </div>
      <Card className="space-y-5">
        <h2 className="font-display text-4xl text-[color:var(--text)]">{title}</h2>
        <p className="max-w-3xl text-base leading-8 text-[color:var(--muted)]">{description}</p>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/dashboard">Back to overview</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/settings">Open settings</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
