"use client";

import dynamic from "next/dynamic";

// Defer the motion-powered hero showcase: it's decorative and motion is a heavy
// client dependency, so we load it client-side after hydration with a skeleton
// placeholder holding its space (no layout shift, smaller initial bundle).
const HeroShowcase = dynamic(
  () => import("./hero-showcase").then((m) => m.HeroShowcase),
  {
    ssr: false,
    loading: () => (
      <div className="w-full max-w-xl lg:max-w-lg">
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-24 w-full animate-pulse rounded-[1.6rem] bg-[color:var(--primary)]/6"
            />
          ))}
        </div>
      </div>
    ),
  },
);

export function HeroShowcaseLazy() {
  return <HeroShowcase />;
}
