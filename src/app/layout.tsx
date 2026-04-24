import type { Metadata } from "next";
import { Toaster } from "sonner";

import "@/app/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL ?? "http://localhost:3000"),
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
