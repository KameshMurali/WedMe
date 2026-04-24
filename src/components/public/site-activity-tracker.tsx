"use client";

import { useEffect } from "react";

export function SiteActivityTracker({ slug }: { slug: string }) {
  useEffect(() => {
    const controller = new AbortController();

    void fetch("/api/analytics", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        slug,
        type: "PAGE_VIEW",
        path: window.location.pathname,
      }),
      signal: controller.signal,
    }).catch(() => null);

    return () => controller.abort();
  }, [slug]);

  return null;
}
