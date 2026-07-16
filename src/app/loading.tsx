import { Spinner } from "@/components/ui/spinner";

// Global fallback for top-level routes (home, pricing, auth) while they load.
export default function RootLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Spinner className="h-8 w-8" />
        <p role="status" className="text-sm uppercase tracking-[0.22em] text-[color:var(--muted)]">
          Loading
        </p>
      </div>
    </div>
  );
}
