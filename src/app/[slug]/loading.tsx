import { Skeleton } from "@/components/ui/skeleton";

// Fallback while a public wedding page (/[slug]/*) resolves its snapshot.
export default function PublicSiteLoading() {
  return (
    <main className="section-shell py-10">
      <div className="loading-bar mb-6" aria-hidden="true" />
      <p role="status" className="sr-only">
        Loading the wedding site…
      </p>
      {/* Header row */}
      <div className="flex flex-col gap-6 rounded-[2rem] border border-black/5 bg-white/70 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-[1.3rem]" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <Skeleton className="h-11 w-64 rounded-full" />
      </div>

      {/* Hero-ish block */}
      <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Skeleton className="h-[22rem] w-full" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-11 w-40 rounded-full" />
        </div>
      </div>
    </main>
  );
}
