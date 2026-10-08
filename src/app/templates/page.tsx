import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { SectionHeading } from "@/components/ui/section-heading";
import { siteUrl } from "@/lib/constants";
import { templateRegistry } from "@/lib/template-registry";

// The sixteen designs, as sixteen real pages.
//
// They existed only as gradient bars on the homepage and as
// /dev/template-gallery/[templateKey], which 404s unless TEMPLATE_GALLERY=1 is
// set. So the product's clearest differentiator — sixteen culturally specific
// designs, not sixteen recolours — had no indexable surface at all. Someone
// searching "Tamil wedding website template" or "Nikkah wedding website" could
// not land on anything, because there was nothing to land on.
//
// This is also what makes scroll-as-navigation possible on the homepage: a
// page that routes readers into choices needs the choices to be real
// destinations with real URLs, not anchors to a section.

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Wedding Website Templates · 16 Designs for Every Tradition",
  description:
    "Sixteen wedding website designs, each built for a specific tradition: South Indian temple, Tamil kolam, North Indian palace, Nikkah, Christian chapel, Chinese double happiness, Khaleeji, Mediterranean, Tuscan, tropical and more. Switch any time without rebuilding your site.",
  alternates: { canonical: "/templates" },
  openGraph: {
    title: "Wedding Website Templates · 16 Designs for Every Tradition",
    description:
      "Sixteen wedding website designs, each built for a specific tradition. Switch any time without rebuilding your site.",
    url: `${siteUrl}/templates`,
    type: "website",
  },
};

// An ItemList tells a search engine these sixteen pages are one collection
// rather than sixteen unrelated URLs, which is what earns the sitelinks.
const collectionSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Wedding Website Templates",
  url: `${siteUrl}/templates`,
  description:
    "Sixteen wedding website designs, each built for a specific wedding tradition.",
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: templateRegistry.length,
    itemListElement: templateRegistry.map((template, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: template.name,
      description: template.description,
      url: `${siteUrl}/templates/${template.key}`,
    })),
  },
};

export default function TemplatesIndexPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <main className="pb-24">
        <section className="section-shell pt-10">
          <SectionHeading
            eyebrow="Designs"
            title="Sixteen designs, each built for a tradition."
            description="Not one design in sixteen colourways. A kolam is drawn at the threshold of a Tamil home; a gopuram crowns a South Indian temple; girih geometry belongs to a Nikkah and not to a chapel. Each design carries its own ornament, palette and typography. Your story, events and photos flow into any of them, so changing your mind costs one click."
          />
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild>
              <Link href={"/register" as Route}>
                Start yours free <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={"/kammonbeginnings" as Route}>See a real wedding site</Link>
            </Button>
          </div>
        </section>

        <section className="section-shell mt-12">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {templateRegistry.map((template) => (
              <Card
                key={template.key}
                className="group h-full overflow-hidden p-0 transition duration-300 hover:-translate-y-1.5 hover:shadow-glow"
              >
                <Link href={`/templates/${template.key}` as Route} className="block">
                  <div className="h-44 w-full overflow-hidden">
                    <div
                      className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-105"
                      style={{ background: template.previewGradient }}
                    />
                  </div>
                  <div className="space-y-3 p-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge>{template.mood}</Badge>
                      {template.tier === "premium" ? (
                        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                          Together &amp; Forever
                        </span>
                      ) : (
                        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                          Free plan
                        </span>
                      )}
                    </div>
                    <h2 className="font-display text-3xl text-[color:var(--text)]">{template.name}</h2>
                    <p className="text-sm leading-7 text-[color:var(--muted)]">{template.description}</p>
                    <p className="inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--primary)]">
                      See this design <ArrowRight className="h-4 w-4" />
                    </p>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        </section>
      </main>
      <MarketingFooter />
    </>
  );
}
