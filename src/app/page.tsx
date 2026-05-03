import type { Route } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import {
  ArrowRight,
  CalendarRange,
  HeartHandshake,
  ImageIcon,
  LayoutDashboard,
  LogIn,
  LogOut,
  Palette,
  PlayCircle,
} from "lucide-react";

import { logoutAction } from "@/actions/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { resolveWorkspaceResumePath, workspaceResumeCookieName } from "@/lib/constants";
import { templateRegistry } from "@/lib/template-registry";
import { getCurrentUser } from "@/server/auth/session";
import { getWorkspaceShellForUser } from "@/server/repositories/wedding-site";

const featureHighlights = [
  {
    title: "Elegant public wedding websites",
    description:
      "Deliver a cinematic, mobile-first guest experience with story timelines, event guidance, schedules, galleries, RSVPs, videos, and post-event memories.",
    icon: HeartHandshake,
  },
  {
    title: "Couple dashboard and builder",
    description:
      "Give couples a polished admin area with secure login, content editing, template switching, theme tuning, analytics, moderation, and publishing controls.",
    icon: LayoutDashboard,
  },
  {
    title: "Reusable SaaS architecture",
    description:
      "Scale from one wedding to many with Prisma data models, publish snapshots, storage abstraction, validation, and a theme-driven template system.",
    icon: Palette,
  },
];

function getResumeLabel(pathname: string) {
  const labels: Record<string, string> = {
    "/dashboard": "Overview",
    "/dashboard/templates": "Templates",
    "/dashboard/content": "Content",
    "/dashboard/events": "Events",
    "/dashboard/rsvps": "RSVPs",
    "/dashboard/uploads": "Moderation",
    "/dashboard/settings": "Settings",
    "/dashboard/preview": "Preview",
  };

  return labels[pathname] ?? "Dashboard";
}

export default async function HomePage() {
  const user = await getCurrentUser();
  const workspace = user ? await getWorkspaceShellForUser(user.id) : null;
  const cookieStore = await cookies();
  const rawResumePath = cookieStore.get(workspaceResumeCookieName)?.value;
  const safeResumePath = resolveWorkspaceResumePath(rawResumePath);
  const resumeLabel = getResumeLabel(safeResumePath);
  const hasWorkspace = Boolean(workspace);
  const workspaceHref = (hasWorkspace ? safeResumePath : "/login") as Route;

  return (
    <main className="pb-24">
      <section className="section-shell pt-6">
        <div className="glass-panel fade-border relative overflow-hidden rounded-[2rem] border border-white/70 px-6 py-6 rich-shadow sm:px-10 lg:px-14 lg:py-10">
          <div className="absolute inset-0 bg-hero-mesh opacity-90" />
          <div className="relative flex flex-wrap items-center justify-between gap-4 border-b border-white/60 pb-6">
            <div>
              <p className="font-display text-2xl text-[#1f1117]">ToNewBeginning.com</p>
              <p className="mt-2 text-sm text-stone-700">
                A premium wedding platform with a calm couple workspace and polished guest journey.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild variant="outline">
                <Link href={workspaceHref}>
                  <LogIn className="h-4 w-4" />
                  {hasWorkspace ? "Resume workspace" : "Log in"}
                </Link>
              </Button>
              {hasWorkspace ? (
                <>
                  <div className="rounded-full border border-white/70 bg-white/70 px-4 py-2 text-sm text-stone-700">
                    Signed in as {user?.email}
                  </div>
                  <form action={logoutAction}>
                    <Button type="submit" variant="ghost">
                      <LogOut className="h-4 w-4" />
                      Log out
                    </Button>
                  </form>
                </>
              ) : (
                <Button asChild variant="ghost">
                  <Link href="/register">Create Couple Account</Link>
                </Button>
              )}
            </div>
          </div>

          <div className="relative mt-8 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <Badge>Craft Your Celebration</Badge>
              <h1 className="mt-5 max-w-3xl font-display text-4xl leading-[1.04] text-[#1f1117] sm:text-5xl lg:text-6xl">
                Build your wedding event as a premium platform, not just a single site.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-stone-800 sm:text-lg">
                ToNewBeginning.com is a next-generation wedding website builder for elegant storytelling,
                flexible templates, RSVP workflows, guest memories, and a calm, luxurious admin
                experience.
              </p>
              <div className="mt-6 rounded-[1.6rem] border border-white/70 bg-white/75 p-4 backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--primary)]">
                  Resume where you left off
                </p>
                <p className="mt-2 text-base font-semibold text-[#1f1117]">
                  {hasWorkspace ? `Continue from ${resumeLabel}` : "Home screen login now resumes your last workspace area."}
                </p>
                <p className="mt-2 text-sm leading-7 text-stone-700">
                  Returning couples can log in from the home screen and jump back into templates,
                  content, settings, preview, or whichever dashboard area they used last.
                </p>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/kammonbeginnings">
                    Open Demo Site <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href={workspaceHref}>
                    {hasWorkspace ? (
                      <>
                        Resume {resumeLabel} <PlayCircle className="h-4 w-4" />
                      </>
                    ) : (
                      "Log in to resume"
                    )}
                  </Link>
                </Button>
              </div>
            </div>
            <div className="grid w-full max-w-xl gap-4 sm:grid-cols-3">
              <Card className="space-y-3 p-5">
                <CalendarRange className="h-5 w-5 text-[color:var(--primary)]" />
                <p className="text-sm font-semibold text-ink">Structured events</p>
                <p className="text-sm leading-6 text-stone-600">Mehendi to reception with detailed guidance.</p>
              </Card>
              <Card className="space-y-3 p-5">
                <ImageIcon className="h-5 w-5 text-[color:var(--primary)]" />
                <p className="text-sm font-semibold text-ink">Guest memories</p>
                <p className="text-sm leading-6 text-stone-600">Moderated uploads, wishes, and post-event galleries.</p>
              </Card>
              <Card className="space-y-3 p-5">
                <Palette className="h-5 w-5 text-[color:var(--primary)]" />
                <p className="text-sm font-semibold text-ink">Template engine</p>
                <p className="text-sm leading-6 text-stone-600">Same content model, many premium visual directions.</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell mt-20">
        <SectionHeading
          eyebrow="Product Vision"
          title="A more flexible, modern, and advanced alternative to the wedding website status quo."
          description="The product is structured as a true wedding website SaaS: public storytelling, secure admin workflows, and reusable templates all sitting on one shared platform architecture."
        />
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {featureHighlights.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[color:var(--accent)]/10">
                  <Icon className="h-6 w-6 text-[color:var(--primary)]" />
                </div>
                <h3 className="font-display text-3xl text-[color:var(--text)]">{feature.title}</h3>
                <p className="text-sm leading-7 text-[color:var(--muted)]">{feature.description}</p>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="section-shell mt-20">
        <SectionHeading
          eyebrow="Template System"
          title="Five premium starting points, one shared content model."
          description="Each template supports the same sections, data model, and dashboard tooling. Couples can switch themes without rebuilding their site."
        />
        <div className="mt-10 grid gap-5 lg:grid-cols-5">
          {templateRegistry.map((template) => (
            <Card key={template.key} className="overflow-hidden p-0">
              <div className="h-40 w-full" style={{ background: template.previewGradient }} />
              <div className="space-y-3 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                  {template.mood}
                </p>
                <h3 className="font-display text-2xl text-[color:var(--text)]">{template.name}</h3>
                <p className="text-sm leading-7 text-[color:var(--muted)]">{template.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="section-shell mt-20">
        <Card className="grid gap-8 bg-gradient-to-br from-[#26171c] via-[#3d2730] to-[#7b5842] text-white lg:grid-cols-[1.3fr_0.9fr]">
          <div>
            <SectionHeading
              eyebrow="Demo Site : KamMonBeginnings"
              title="A seeded wedding experience is included for Kamesh & Monisha."
              description="Sample events, story milestones, dress code boards, FAQs, RSVP data, guest messages, uploads, and themed imagery are all seeded so the platform feels investor-demo ready on day one."
            />
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild className="bg-white text-stone-900 hover:bg-amber-100">
                <Link href="/kammonbeginnings">View the wedding site</Link>
              </Button>
              <Button asChild variant="secondary" className="bg-white/10 text-white hover:bg-white/20">
                <Link href={workspaceHref}>{hasWorkspace ? "Resume workspace" : "Log in"}</Link>
              </Button>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              "Secure registration and login",
              "Theme and template selection",
              "RSVP analytics and CSV export",
              "Guest uploads moderation",
            ].map((item) => (
              <div
                key={item}
                className="rounded-[1.6rem] border border-white/10 bg-white/10 px-5 py-5 text-sm font-medium backdrop-blur"
              >
                {item}
              </div>
            ))}
          </div>
        </Card>
      </section>
    </main>
  );
}
