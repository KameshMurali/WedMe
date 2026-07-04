import Link from "next/link";

export function MarketingFooter() {
  return (
    <footer className="section-shell mt-20 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-black/8 pt-8 text-sm text-stone-500">
        <p>© {new Date().getFullYear()} ToNewBeginning.com · All rights reserved.</p>
        <div className="flex flex-wrap items-center gap-5">
          <a href="mailto:hello@tonewbeginning.com" className="transition hover:text-stone-800">
            Contact / Support
          </a>
          <Link href="/privacy" className="transition hover:text-stone-800">
            Privacy Policy
          </Link>
          <Link href="/terms" className="transition hover:text-stone-800">
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}
