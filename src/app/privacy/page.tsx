import type { Metadata } from "next";
import Link from "next/link";

import { MarketingFooter } from "@/components/marketing/marketing-footer";

export const metadata: Metadata = {
  title: "Privacy Policy · ToNewBeginning",
  description: "How ToNewBeginning.com collects, uses, and protects your personal information.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <>
      <main className="section-shell pb-16 pt-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Legal</p>
          <h1 className="mt-4 font-display text-5xl text-stone-900">Privacy Policy</h1>
          <p className="mt-4 text-sm text-stone-500">Last updated: June 2025</p>

          <div className="prose prose-stone mt-12 max-w-none text-sm leading-8">
            <h2>What we collect</h2>
            <p>
              When you use ToNewBeginning.com as a couple or as a wedding guest, we may collect:
            </p>
            <ul>
              <li>
                <strong>Account information</strong> — name, email address, and password (hashed) when
                you register as a couple.
              </li>
              <li>
                <strong>RSVP responses</strong> — your name, email address, attendance status, meal
                preferences, and any notes you submit through a wedding RSVP form.
              </li>
              <li>
                <strong>Photo uploads</strong> — images you upload to a wedding's guest memory wall.
              </li>
              <li>
                <strong>Guest messages and wishes</strong> — any written messages you leave for the
                couple.
              </li>
              <li>
                <strong>Usage data</strong> — anonymised page-view analytics (pages visited, time on
                site) to help couples understand guest engagement.
              </li>
            </ul>

            <h2>How we use your information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Deliver RSVP responses to the couple whose wedding site you are visiting.</li>
              <li>Display your photos and messages on the wedding's memory wall (if you submit them).</li>
              <li>Allow couples to manage their wedding website, guest list, and content.</li>
              <li>Send transactional emails (e.g. account verification, password reset).</li>
              <li>Improve the platform through anonymised analytics.</li>
            </ul>
            <p>We do not sell your personal data to third parties. We do not use your data for advertising.</p>

            <h2>Data sharing</h2>
            <p>
              RSVP responses, guest messages, and uploads you submit are shared with the couple who
              owns the wedding site you are visiting. They may export this data (e.g. as a CSV) to
              manage their guest list. Outside of this, your data is not shared with other third
              parties except service providers necessary to operate the platform (e.g. cloud storage,
              email delivery), who are bound by confidentiality agreements.
            </p>

            <h2>Data retention</h2>
            <p>
              We retain your data for as long as the associated wedding site remains active. Couples
              may delete their site and all associated data at any time from their dashboard. If you
              would like us to remove your personal information, please contact us at the address
              below.
            </p>

            <h2>Cookies</h2>
            <p>
              We use a small number of strictly necessary cookies for authentication (keeping you
              signed in). We do not use advertising or third-party tracking cookies.
            </p>

            <h2>Your rights</h2>
            <p>
              You may request access to, correction of, or deletion of your personal data at any
              time by emailing{" "}
              <a href="mailto:privacy@tonewbeginning.com">privacy@tonewbeginning.com</a>. We will
              respond within 30 days.
            </p>

            <h2>Contact</h2>
            <p>
              Questions about this policy? Email{" "}
              <a href="mailto:privacy@tonewbeginning.com">privacy@tonewbeginning.com</a>.
            </p>
          </div>

          <div className="mt-12 flex gap-4 text-sm">
            <Link href="/" className="text-stone-500 underline hover:text-stone-800">
              ← Back to home
            </Link>
            <Link href="/terms" className="text-stone-500 underline hover:text-stone-800">
              Terms of Service →
            </Link>
          </div>
        </div>
      </main>
      <MarketingFooter />
    </>
  );
}
