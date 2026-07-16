// Suspense fallback for every dashboard route (nearest-ancestor boundary):
// the sidebar layout stays interactive while the content pane shows this.
export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="loading-bar" aria-hidden="true" />
      <p role="status" className="sr-only">
        Loading your workspace…
      </p>
      <div className="animate-pulse space-y-6">
        <div className="space-y-3">
          <div className="h-3 w-24 rounded-full bg-black/8" />
          <div className="h-10 w-2/3 max-w-md rounded-2xl bg-black/8" />
          <div className="h-3 w-1/2 max-w-sm rounded-full bg-black/6" />
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="h-28 rounded-[2rem] border border-black/5 bg-white/60" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-72 rounded-[2rem] border border-black/5 bg-white/60" />
          <div className="h-72 rounded-[2rem] border border-black/5 bg-white/60" />
        </div>
      </div>
    </div>
  );
}
