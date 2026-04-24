import { notFound } from "next/navigation";

import { AdminShell } from "@/components/admin/admin-shell";
import { requireUser } from "@/server/auth/session";
import { getWeddingSiteForUser } from "@/server/repositories/wedding-site";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await requireUser();
  const site = await getWeddingSiteForUser(user.id);

  if (!site) {
    notFound();
  }

  return (
    <AdminShell
      site={{
        brandName: site.brandName,
        slug: site.slug,
        coupleNames: `${site.couple.partnerOneName} & ${site.couple.partnerTwoName}`,
        status: site.publishSettings?.status ?? "DRAFT",
      }}
    >
      {children}
    </AdminShell>
  );
}
