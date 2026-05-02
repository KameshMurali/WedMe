import { TemplateCustomizer } from "@/components/admin/template-customizer";
import { Card } from "@/components/ui/card";
import { templateRegistry } from "@/lib/template-registry";
import { requireUser } from "@/server/auth/session";
import { getTemplateSettingsForUser } from "@/server/repositories/wedding-site";

export default async function DashboardTemplatesPage() {
  const user = await requireUser();
  const site = await getTemplateSettingsForUser(user.id);
  if (!site) return null;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">Templates</p>
        <h1 className="mt-3 font-display text-5xl text-[color:var(--text)]">Theme customisation</h1>
      </div>
      <Card>
        <TemplateCustomizer
          templates={templateRegistry.map((template) => ({
            key: template.key,
            name: template.name,
            description: template.description,
            mood: template.mood,
            previewGradient: template.previewGradient,
            themeDefaults: template.themeDefaults,
          }))}
          defaultValues={{
            templateKey: site.templatePreset.key,
            paletteKey: site.theme?.paletteKey ?? "champagne",
            headingFontKey: site.theme?.headingFontKey ?? "display",
            bodyFontKey: site.theme?.bodyFontKey ?? "body",
            primaryColor: site.theme?.primaryColor ?? "#6e4f35",
            accentColor: site.theme?.accentColor ?? "#b88c4a",
            backgroundColor: site.theme?.backgroundColor ?? "#fdf8f3",
            surfaceColor: site.theme?.surfaceColor ?? "#fffaf6",
            textColor: site.theme?.textColor ?? "#2b1a18",
            mutedColor: site.theme?.mutedColor ?? "#8b6f68",
            borderRadius: site.theme?.borderRadius ?? "2rem",
            buttonVariant: site.theme?.buttonVariant ?? "solid",
            shadowStyle: site.theme?.shadowStyle ?? "glow",
          }}
        />
      </Card>
    </div>
  );
}
