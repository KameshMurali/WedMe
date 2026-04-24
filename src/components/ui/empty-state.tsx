import { Card } from "@/components/ui/card";

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Card className="border-dashed text-center">
      <h3 className="font-display text-2xl text-[color:var(--text)]">{title}</h3>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[color:var(--muted)]">{description}</p>
    </Card>
  );
}
