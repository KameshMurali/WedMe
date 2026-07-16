import type { Metadata } from "next";
import { Cinzel, Cormorant_Garamond, Manrope } from "next/font/google";
import { Toaster } from "sonner";

import { NavProgress } from "@/components/ui/nav-progress";
import "@/app/globals.css";
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

export const metadata: Metadata = {
  metadataBase: new URL(env.APP_URL),
  title: "ToNewBeginning.com",
  description:
    "ToNewBeginning.com is a wedding website builder for Indian and South Asian couples: multi-event timelines, RSVP management, photo galleries, and a polished guest experience.",
  alternates: { canonical: "/" },
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
