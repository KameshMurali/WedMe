import type { Metadata } from "next";
import Link from "next/link";

import { MarketingFooter } from "@/components/marketing/marketing-footer";

export const metadata: Metadata = {
  title: "Terms of Service · ToNewBeginning",
  description: "The terms governing your use of ToNewBeginning.com.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <>
      <main className="section-shell pb-16 pt-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Legal</p>
          <h1 className="mt-4 font-display text-5xl text-stone-900">Terms of Service</h1>
          <p className="mt-4 text-sm text-stone-500">Last updated: June 2025</p>

          <div className="prose prose-stone mt-12 max-w-none text-sm leading-8">
            <h2>Acceptance of terms</h2>
            <p>
              By accessing or using ToNewBeginning.com, you agree to be bound by these Terms of
              Service. If you do not agree, please do not use the platform.
            </p>

            <h2>Who can use the platform</h2>
            <p>
              ToNewBeginning.com is available to individuals aged 18 or older. By registering, you
              represent that you meet this requirement and that the information you provide is
              accurate.
            </p>

            <h2>Couple accounts</h2>
            <p>
              Couples who register an account may create and publish a wedding website, manage guest
              responses, upload media, and customise their site using the tools provided. You are
              responsible for maintaining the security of your login credentials and for all activity
              that occurs under your account.
            </p>

            <h2>Guest use</h2>
            <p>
              Guests who submit RSVPs, messages, or photo uploads to a wedding site grant the couple
              a non-exclusive licence to display that content on their wedding site. You confirm that
              any content you submit does not infringe third-party rights and is not unlawful,
              harmful, or offensive.
            </p>

            <h2>Acceptable use</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Use the platform for any unlawful purpose.</li>
              <li>Upload content that is defamatory, obscene, or infringes intellectual property rights.</li>
              <li>Attempt to gain unauthorised access to another user's account or data.</li>
              <li>Use automated tools to scrape or extract data from the platform.</li>
            </ul>

            <h2>Content ownership</h2>
            <p>
              You retain ownership of content you upload (photos, messages, site copy). By uploading,
              you grant ToNewBeginning.com a limited licence to host and display that content as
              needed to operate the service. We do not claim ownership of your content.
            </p>

            <h2>Platform availability</h2>
            <p>
              We strive to keep the platform available but cannot guarantee uninterrupted access. We
              may suspend or terminate accounts that violate these terms.
            </p>

            <h2>Limitation of liability</h2>
            <p>
              To the fullest extent permitted by law, ToNewBeginning.com is not liable for indirect,
              incidental, or consequential damages arising from your use of the platform. Our total
              liability to you shall not exceed the amount you paid us in the 12 months preceding the
              claim.
            </p>

            <h2>Changes to these terms</h2>
            <p>
              We may update these terms from time to time. We will notify registered users of
              material changes by email. Continued use of the platform after changes are posted
              constitutes acceptance of the revised terms.
            </p>

            <h2>Contact</h2>
            <p>
              Questions about these terms? Email{" "}
              <a href="mailto:hello@tonewbeginning.com">hello@tonewbeginning.com</a>.
            </p>
          </div>

          <div className="mt-12 flex gap-4 text-sm">
            <Link href="/" className="text-stone-500 underline hover:text-stone-800">
              ← Back to home
            </Link>
            <Link href="/privacy" className="text-stone-500 underline hover:text-stone-800">
              Privacy Policy →
            </Link>
          </div>
        </div>
      </main>
      <MarketingFooter />
    </>
  );
}
