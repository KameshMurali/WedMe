import type { Metadata } from "next";
import { Toaster } from "sonner";

// Self-hosted through npm, NOT next/font/google.
//
// next/font/google downloads font CSS and font files during the build, and that
// network call is not reliable. It broke three consecutive production deploys.
// Turbopack reported it as an unresolvable module; switching to webpack exposed
// what was actually happening:
//
//   TypeError: Cannot read properties of null (reading '1')
//     at node_modules/next/dist/compiled/@next/font/dist/google/loader.js:122:78
//     at async nextFontGoogleFontLoader
//
// That is a regex match against the fetched CSS returning null and then being
// indexed: the response was not the CSS the parser expected. It struck a
// different font each time (Noto Serif SC once, Cormorant Garamond the next),
// which is what finally ruled out every font-specific theory.
//
// @fontsource ships the files as ordinary dependencies, so a build needs no
// third-party network at all. The weight files below carry every subset with
// unicode-range, so a mixed "Kamesh & கமலா" heading still holds one face rather
// than falling back mid-string, exactly as the subsets option did before.
//
// Family names become CSS variables in globals.css; tailwind.config.ts already
// reads those variables and needed no change.
import "@fontsource/manrope/400.css";
import "@fontsource/manrope/500.css";
import "@fontsource/manrope/600.css";
import "@fontsource/manrope/700.css";
import "@fontsource/cormorant-garamond/400.css";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/600.css";
import "@fontsource/cinzel/600.css";
import "@fontsource/noto-serif-tamil/400.css";
import "@fontsource/noto-serif-tamil/500.css";
import "@fontsource/noto-serif-tamil/600.css";
import "@fontsource/noto-naskh-arabic/400.css";
import "@fontsource/noto-naskh-arabic/500.css";
import "@fontsource/noto-naskh-arabic/600.css";

import { NavProgress } from "@/components/ui/nav-progress";
import "@/app/globals.css";
import { siteUrl } from "@/lib/constants";
import { env } from "@/lib/env";

const siteDescription =
  "ToNewBeginning.com is a multi-event wedding website builder for every celebration, including Indian, South Asian, fusion, and Western multi-day weddings: multi-event timelines, RSVP management, photo galleries, and a polished guest experience.";

export const metadata: Metadata = {
  // Use the shared siteUrl (prod fallback) rather than env.APP_URL, which
  // defaults to localhost — otherwise a missing prod APP_URL would emit
  // localhost canonicals/OG URLs to search engines.
  metadataBase: new URL(siteUrl),
  title: {
    default: "ToNewBeginning.com",
    template: "%s · ToNewBeginning",
  },
  description: siteDescription,
  applicationName: "ToNewBeginning",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "ToNewBeginning",
    url: siteUrl,
    title: "ToNewBeginning.com",
    description: siteDescription,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ToNewBeginning: one beautiful website for your whole wedding",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ToNewBeginning.com",
    description: siteDescription,
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
  },
  // Emits <meta name="google-site-verification"> only when the token is set;
  // harmless if the domain is verified via DNS instead.
  verification: env.GOOGLE_SITE_VERIFICATION
    ? { google: env.GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <NavProgress />
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
