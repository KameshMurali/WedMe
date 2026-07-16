// Root suspense fallback (homepage, pricing, auth pages).
export default function RootLoading() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6">
      <p className="font-display text-3xl text-stone-900">ToNewBeginning.com</p>
      <div className="w-full max-w-xs">
        <div className="loading-bar" aria-hidden="true" />
      </div>
      <p role="status" className="text-sm text-stone-500">
        Setting things up…
      </p>
    </main>
  );
}
