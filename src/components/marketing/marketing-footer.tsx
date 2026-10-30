import Link from "next/link";

export function MarketingFooter() {
  return (
    <footer className="section-shell mt-20 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[color:var(--border)] pt-8 text-sm text-[color:var(--muted)]">
        <p>© {new Date().getFullYear()} ToNewBeginning.com · All rights reserved.</p>
        <div className="flex flex-wrap items-center gap-5">
          <a href="mailto:hello@tonewbeginning.com" className="transition hover:text-[color:var(--text)]">
            Contact / Support
          </a>
          <Link href="/privacy" className="transition hover:text-[color:var(--text)]">
            Privacy Policy
          </Link>
          <Link href="/terms" className="transition hover:text-[color:var(--text)]">
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}
