import type { Metadata } from "next";
import { Toaster } from "sonner";

import "@/app/globals.css";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  metadataBase: new URL(env.APP_URL),
  title: "ToNewBeginning.com",
  description:
    "A premium, template-driven wedding website platform for elegant storytelling, guest management, RSVPs, and memories.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
