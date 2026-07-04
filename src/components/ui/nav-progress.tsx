"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

// Thin top progress bar (GitHub/YouTube-style) that appears on any client-side
// navigation and completes when the route actually changes. Dependency-free:
// we detect same-origin link clicks + back/forward, rather than monkey-patching
// the History API, to stay safe alongside Next's router.
export function NavProgress() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);
  const timers = useRef<number[]>([]);

  function clearTimers() {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  }

  function start() {
    clearTimers();
    setVisible(true);
    setWidth(12);
    timers.current.push(window.setTimeout(() => setWidth(55), 120));
    timers.current.push(window.setTimeout(() => setWidth(80), 420));
    // Creep toward (not to) 100 so slow loads still show motion.
    timers.current.push(window.setTimeout(() => setWidth(92), 900));
  }

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as HTMLElement | null)?.closest?.("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      try {
        const url = new URL(anchor.href, window.location.href);
        if (url.origin !== window.location.origin) return; // external
        if (url.pathname === window.location.pathname && url.search === window.location.search) return; // same page
        start();
      } catch {
        /* ignore malformed hrefs */
      }
    }
    document.addEventListener("click", onClick, { capture: true });
    window.addEventListener("popstate", start);
    return () => {
      document.removeEventListener("click", onClick, { capture: true } as EventListenerOptions);
      window.removeEventListener("popstate", start);
      clearTimers();
    };
  }, []);

  // Complete the bar when the pathname changes (navigation finished).
  useEffect(() => {
    if (!visible) return;
    clearTimers();
    setWidth(100);
    const done = window.setTimeout(() => {
      setVisible(false);
      setWidth(0);
    }, 260);
    timers.current.push(done);
    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[200] h-[3px] transition-opacity duration-200"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <div
        className="h-full bg-[color:var(--primary)] transition-[width] duration-300 ease-out"
        style={{ width: `${width}%`, boxShadow: "0 0 10px color-mix(in srgb, var(--primary) 60%, transparent)" }}
      />
    </div>
  );
}
