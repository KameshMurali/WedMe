"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Globe } from "lucide-react";

import { currencies, type CurrencyCode } from "@/lib/pricing";
import { COOKIE_NAME } from "@/lib/geo";

export function CurrencySwitcher({ current }: { current: CurrencyCode }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function setCurrency(next: CurrencyCode) {
    // 1-year cookie so the user's choice sticks across visits.
    const maxAge = 60 * 60 * 24 * 365;
    document.cookie = `${COOKIE_NAME}=${next}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
    startTransition(() => router.refresh());
  }

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-3 py-1.5 text-xs shadow-sm">
      <Globe className="h-3.5 w-3.5 text-[color:var(--muted)]" />
      <span className="text-[color:var(--muted)]">Show prices in</span>
      <select
        aria-label="Currency"
        value={current}
        disabled={isPending}
        onChange={(event) => setCurrency(event.target.value as CurrencyCode)}
        className="bg-transparent text-xs font-semibold text-[color:var(--text)] outline-none"
      >
        {Object.values(currencies).map((c) => (
          <option key={c.code} value={c.code}>
            {c.flag} {c.code}
          </option>
        ))}
      </select>
    </div>
  );
}
