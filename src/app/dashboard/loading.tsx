import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Shown instantly (React Suspense fallback) while any /dashboard/* route
// fetches its server data — the sidebar from dashboard/layout stays, only the
// content area shimmers, so navigation never feels frozen.
export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="loading-bar" aria-hidden="true" />
      <p role="status" className="sr-only">
        Loading your workspace…
      </p>
      <div className="space-y-3">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-16" />
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} className="space-y-4">
            <Skeleton className="h-8 w-40" />
            {Array.from({ length: 4 }).map((_, j) => (
              <Skeleton key={j} className="h-14 w-full" />
            ))}
          </Card>
        ))}
      </div>
    </div>
  );
}
