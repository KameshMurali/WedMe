import { Card } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <Card className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
        {label}
      </p>
      <p className="font-display text-4xl text-[color:var(--text)]">{value}</p>
      {hint ? <p className="text-sm text-[color:var(--muted)]">{hint}</p> : null}
    </Card>
  );
}
