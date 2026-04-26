import Link from "next/link";

import { logoutAction } from "@/actions/auth";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireUser } from "@/server/auth/session";
import { getWeddingSiteForUser } from "@/server/repositories/wedding-site";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await requireUser();
  const site = await getWeddingSiteForUser(user.id);

  if (!site) {
    return (
      <main className="section-shell flex min-h-screen items-center justify-center py-16">
        <div className="w-full max-w-2xl rounded-[2rem] border border-black/8 bg-white/90 p-10 shadow-[0_32px_80px_rgba(43,26,24,0.08)]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--primary)]">
            Workspace recovery
          </p>
          <h1 className="mt-4 font-display text-5xl text-[color:var(--text)]">
            We couldn&apos;t reopen your workspace yet.
          </h1>
          <p className="mt-4 text-base leading-8 text-[color:var(--muted)]">
            Your account is valid, but the wedding workspace record is still being recovered. Try
            signing out and back in once more. If this keeps happening, the database setup may
            still be syncing on this deployment.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full bg-[color:var(--primary)] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Return home
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full border border-black/10 px-6 py-3 text-sm font-semibold text-[color:var(--text)] transition hover:bg-black/5"
              >
                Log out
              </button>
            </form>
          </div>
        </div>
      </main>
    );
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
