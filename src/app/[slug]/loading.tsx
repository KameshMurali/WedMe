// Suspense fallback for public wedding pages — guests (mostly on mobile)
// see an immediate shimmer instead of a frozen screen while sections load.
export default function PublicSiteLoading() {
  return (
    <main className="min-h-screen bg-[#fdf8f3] px-4 pt-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="loading-bar" aria-hidden="true" />
        <p role="status" className="sr-only">
          Loading the wedding site…
        </p>
        <div className="animate-pulse space-y-6">
          <div className="h-24 rounded-[2rem] border border-black/5 bg-white/70" />
          <div className="h-[40vh] rounded-[2rem] border border-black/5 bg-white/60" />
          <div className="grid gap-5 md:grid-cols-2">
            <div className="h-48 rounded-[2rem] border border-black/5 bg-white/60" />
            <div className="h-48 rounded-[2rem] border border-black/5 bg-white/60" />
          </div>
          <div className="h-40 rounded-[2rem] border border-black/5 bg-white/60" />
        </div>
      </div>
    </main>
  );
}
