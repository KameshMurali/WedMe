import type { Metadata } from "next";
import { Cinzel, Cormorant_Garamond, Manrope } from "next/font/google";
import { Toaster } from "sonner";

import { NavProgress } from "@/components/ui/nav-progress";
import "@/app/globals.css";
import { siteUrl } from "@/lib/constants";
import { env } from "@/lib/env";

// next/font self-hosts these at build time, generates <link rel="preload">,
// and applies font-display: swap — replacing the render-blocking @fontsource
// CSS @import approach that was loading all Manrope weights (~200KB+).
const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-cormorant",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["600"],
  display: "swap",
  variable: "--font-cinzel",
});

const siteDescription =
  "ToNewBeginning.com is a wedding website builder for Indian and South Asian couples: multi-event timelines, RSVP management, photo galleries, and a polished guest experience.";

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
        alt: "ToNewBeginning — one beautiful website for your whole wedding",
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
    <html lang="en" className={`${manrope.variable} ${cormorant.variable} ${cinzel.variable}`}>
      <body>
        <NavProgress />
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
