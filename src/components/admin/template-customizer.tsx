"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Palette } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { updateTemplateThemeAction } from "@/actions/dashboard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { templateSelectionSchema } from "@/lib/validations/engagement";
import { cn } from "@/lib/utils";

type TemplateValues = z.infer<typeof templateSelectionSchema>;

type TemplateOption = {
  key: string;
  name: string;
  description: string;
  mood: string;
  previewGradient: string;
  themeDefaults: Omit<TemplateValues, "templateKey">;
};

type ColorFieldName =
  | "primaryColor"
  | "accentColor"
  | "backgroundColor"
  | "surfaceColor"
  | "textColor"
  | "mutedColor";

const colorFieldMeta: Array<{
  name: ColorFieldName;
  label: string;
  description: string;
}> = [
  {
    name: "primaryColor",
    label: "Primary buttons",
    description: "Used for main actions, highlights, and strong emphasis.",
  },
  {
    name: "accentColor",
    label: "Accent highlight",
    description: "Adds warmth to borders, hovers, and decorative moments.",
  },
  {
    name: "backgroundColor",
    label: "Page background",
    description: "The main canvas behind every section of the site.",
  },
  {
    name: "surfaceColor",
    label: "Card surface",
    description: "Used on content cards, overlays, and soft panels.",
  },
  {
    name: "textColor",
    label: "Main text",
    description: "The headline and body text color across the experience.",
  },
  {
    name: "mutedColor",
    label: "Secondary text",
    description: "Used for captions, labels, helper copy, and quieter text.",
  },
];

// Converts any valid CSS color string to a lowercase 6-digit hex string.
// The canvas trick lets the browser parse rgb(), hsl(), named colors, etc.
// Falls back to the raw string so a partially-typed value doesn't get wiped.
function normalizeToHex(raw: string): string {
  const trimmed = raw.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) return trimmed.toLowerCase();
  // Expand 3-digit shorthand
  if (/^#[0-9a-fA-F]{3}$/.test(trimmed)) {
    const [, r, g, b] = trimmed.match(/^#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])$/)!;
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  try {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext("2d");
    if (!ctx) return trimmed;
    ctx.fillStyle = "#000000";
    ctx.fillStyle = trimmed;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  } catch {
    return trimmed;
  }
}

// The six theme fields that hold CSS colors — normalized to hex before they
// reach the server action (rgb()/hsl()/named colors get converted first).
const colorFieldNames = new Set<string>([
  "primaryColor",
  "accentColor",
  "backgroundColor",
  "surfaceColor",
  "textColor",
  "mutedColor",
]);

// Serialize the full template+theme form into FormData for
// updateTemplateThemeAction, normalizing color fields on the way out. Shared by
// the apply-on-click path and the explicit "Save" (color/typography) path.
function buildTemplateFormData(values: TemplateValues) {
  const formData = new FormData();
  Object.entries(values).forEach(([key, value]) => {
    const normalized = colorFieldNames.has(key) ? normalizeToHex(String(value)) : String(value);
    formData.append(key, normalized);
  });
  return formData;
}

const buttonVariantLabels: Record<string, string> = {
  solid: "Solid button",
  soft: "Soft button",
  outline: "Outline button",
};

const shadowStyleLabels: Record<string, string> = {
  glow: "Soft glow",
  card: "Card depth",
  none: "No shadow",
};

const headingFontLabels: Record<string, string> = {
  display: "Display serif",
  luxe: "Modern luxe serif",
};

const bodyFontLabels: Record<string, string> = {
  body: "Editorial sans",
};

function ColorControl({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="rounded-[1.75rem] border border-black/8 bg-white/75 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[color:var(--text)]">{label}</p>
          <p className="mt-1 text-xs leading-6 text-[color:var(--muted)]">{description}</p>
        </div>
        <span
          className="mt-1 h-8 w-8 shrink-0 rounded-full border border-black/10 shadow-sm"
          style={{ backgroundColor: value }}
        />
      </div>
      <div className="mt-4 flex items-center gap-3">
        <input
          type="color"
          // type="color" only understands 6-digit hex; normalise so it never
          // receives an rgb() string (which would silently show black).
          value={/^#[0-9a-fA-F]{6}$/i.test(value) ? value : normalizeToHex(value)}
          onChange={(event) => onChange(event.target.value)}
          className="h-12 w-16 cursor-pointer rounded-2xl border border-black/10 bg-white p-1"
          aria-label={label}
        />
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          // Normalise to hex when the user leaves the field so rgb() / hsl() /
          // named colours get converted before they reach the form state.
          onBlur={(event) => onChange(normalizeToHex(event.target.value))}
          spellCheck={false}
          autoCapitalize="none"
          placeholder="#000000"
        />
      </div>
    </div>
  );
}

export function TemplateCustomizer({
  templates,
  defaultValues,
}: {
  templates: TemplateOption[];
  defaultValues: TemplateValues;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  // The template card currently being persisted (null when idle). Drives the
  // per-card "Applying…" state and blocks other card clicks mid-save.
  const [pendingTemplateKey, setPendingTemplateKey] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { isDirty },
  } = useForm<TemplateValues>({
    resolver: zodResolver(templateSelectionSchema),
    defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const selectedTemplateKey = watch("templateKey");
  const selectedTemplate = useMemo(
    () => templates.find((template) => template.key === selectedTemplateKey) ?? templates[0],
    [selectedTemplateKey, templates],
  );

  const primaryColor = watch("primaryColor");
  const accentColor = watch("accentColor");
  const backgroundColor = watch("backgroundColor");
  const surfaceColor = watch("surfaceColor");
  const textColor = watch("textColor");
  const mutedColor = watch("mutedColor");
  const borderRadius = watch("borderRadius");
  const buttonVariant = watch("buttonVariant");
  const shadowStyle = watch("shadowStyle");
  const headingFontKey = watch("headingFontKey");
  const bodyFontKey = watch("bodyFontKey");
  const paletteKey = watch("paletteKey");

  // Picking a template now APPLIES it immediately: we optimistically move the
  // selection (so the ring/badge/live preview update instantly) and persist the
  // template + its palette to the draft in the same click, so Preview reflects
  // it without hunting for a Save button. Color/typography edits keep their own
  // explicit Save below.
  function applyTemplate(template: TemplateOption) {
    if (pendingTemplateKey) return; // a save is already in flight
    // Re-clicking the current template with no pending color edits is a no-op,
    // so browsing/comparing doesn't fire redundant writes.
    if (template.key === selectedTemplateKey && !isDirty) return;

    const values: TemplateValues = { templateKey: template.key, ...template.themeDefaults };

    // shouldDirty:false — the template itself is being saved right now, so it
    // must NOT trip the "unsaved changes" bar (that's for later color tweaks).
    setValue("templateKey", template.key, { shouldDirty: false });
    Object.entries(template.themeDefaults).forEach(([key, value]) => {
      setValue(key as keyof Omit<TemplateValues, "templateKey">, value, { shouldDirty: false });
    });

    setPendingTemplateKey(template.key);
    startTransition(async () => {
      const result = await updateTemplateThemeAction({}, buildTemplateFormData(values));
      setPendingTemplateKey(null);
      if (result.error) {
        toast.error(result.error);
        reset(defaultValues); // revert the optimistic selection
        return;
      }

      toast.success("Template applied — open Preview to see it");
      router.refresh();
    });
  }

  function updateColor(name: ColorFieldName, value: string) {
    setValue(name, value, { shouldDirty: true, shouldValidate: true });
  }

  const onSubmit = handleSubmit((values) => {
    startTransition(async () => {
      const result = await updateTemplateThemeAction({}, buildTemplateFormData(values));
      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(result.success ?? "Theme updated");
      router.refresh();
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="grid gap-5 xl:grid-cols-2 2xl:grid-cols-3">
        {templates.map((template) => {
          const isSelected = template.key === selectedTemplateKey;
          const isApplying = pendingTemplateKey === template.key;
          const disabled = pendingTemplateKey !== null;

          return (
            <button
              key={template.key}
              type="button"
              onClick={() => applyTemplate(template)}
              disabled={disabled}
              className={cn("text-left", disabled && !isApplying && "opacity-60")}
            >
              <Card
                className={cn(
                  "h-full overflow-hidden p-0 transition duration-200",
                  disabled ? "cursor-wait" : "cursor-pointer hover:-translate-y-0.5",
                  isSelected && "ring-2 ring-[color:var(--accent)] ring-offset-2 ring-offset-white",
                )}
              >
                <div className="relative h-36 w-full" style={{ background: template.previewGradient }}>
                  {isApplying ? (
                    <span className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[color:var(--text)] shadow-sm">
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[color:var(--accent)] border-t-transparent" />
                      Applying…
                    </span>
                  ) : isSelected ? (
                    <span className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[color:var(--text)] shadow-sm">
                      <CheckCircle2 className="h-4 w-4 text-[color:var(--accent)]" />
                      Applied
                    </span>
                  ) : null}
                </div>
                <div className="p-5">
                  <span className="inline-block rounded-full bg-black/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
                    {template.mood}
                  </span>
                  <h3 className="mt-2 font-display text-2xl leading-snug text-[color:var(--text)]">
                    {template.name}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">{template.description}</p>
                </div>
              </Card>
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="space-y-6">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-[color:var(--accent)]/10 p-3 text-[color:var(--accent)]">
              <Palette className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-3xl text-[color:var(--text)]">Theme controls</h3>
              <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">
                Each color below maps to a specific part of the guest experience, so the couple can
                tune the template with confidence.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {colorFieldMeta.map((field) => (
              <ColorControl
                key={field.name}
                label={field.label}
                description={field.description}
                value={
                  {
                    primaryColor,
                    accentColor,
                    backgroundColor,
                    surfaceColor,
                    textColor,
                    mutedColor,
                  }[field.name]
                }
                onChange={(value) => updateColor(field.name, value)}
              />
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-[color:var(--text)]">Corner softness</span>
              <Input placeholder="2rem" {...register("borderRadius")} />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-[color:var(--text)]">Button style</span>
              <Select {...register("buttonVariant")}>
                <option value="solid">Solid button</option>
                <option value="soft">Soft button</option>
                <option value="outline">Outline button</option>
              </Select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-[color:var(--text)]">Shadow style</span>
              <Select {...register("shadowStyle")}>
                <option value="glow">Soft glow</option>
                <option value="card">Card depth</option>
                <option value="none">No shadow</option>
              </Select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-[color:var(--text)]">Heading font</span>
              <Select {...register("headingFontKey")}>
                <option value="display">Display serif</option>
                <option value="luxe">Modern luxe serif</option>
              </Select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-[color:var(--text)]">Body font</span>
              <Select {...register("bodyFontKey")}>
                <option value="body">Editorial sans</option>
              </Select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-[color:var(--text)]">Palette name</span>
              <Input placeholder="champagne" {...register("paletteKey")} />
            </label>
          </div>
        </Card>

        <Card className="overflow-hidden p-0">
          <div
            className="p-6"
            style={{
              background: `linear-gradient(180deg, ${backgroundColor} 0%, ${surfaceColor} 100%)`,
            }}
          >
            <p
              className="text-xs font-semibold uppercase tracking-[0.18em]"
              style={{ color: mutedColor }}
            >
              Live preview
            </p>
            <h3 className="mt-3 font-display text-4xl leading-tight" style={{ color: textColor }}>
              {selectedTemplate?.name ?? "Selected template"}
            </h3>
            <p className="mt-3 text-sm leading-7" style={{ color: mutedColor }}>
              This preview updates as soon as the template or theme controls change, so the couple
              can understand the mood before saving.
            </p>

            <div
              className="mt-6 rounded-[calc(var(--preview-radius)-0.3rem)] border border-black/5 p-5"
              style={
                {
                  backgroundColor: surfaceColor,
                  color: textColor,
                  "--preview-radius": borderRadius,
                  boxShadow:
                    shadowStyle === "glow"
                      ? `0 20px 60px color-mix(in srgb, ${accentColor} 24%, transparent)`
                      : shadowStyle === "card"
                        ? "0 20px 40px rgba(17, 17, 17, 0.12)"
                        : "none",
                } as React.CSSProperties
              }
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: mutedColor }}>
                {paletteKey}
              </p>
              <h4 className="mt-3 break-words font-display text-3xl leading-tight" style={{ color: textColor }}>
                KamMonBeginnings
              </h4>
              <p className="mt-2 text-sm" style={{ color: mutedColor }}>
                Kamesh & Monisha
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <span
                  className="inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-semibold"
                  style={{
                    backgroundColor: buttonVariant === "outline" ? "transparent" : primaryColor,
                    border: buttonVariant === "outline" ? `1px solid ${primaryColor}` : "1px solid transparent",
                    color: buttonVariant === "outline" || buttonVariant === "soft" ? textColor : surfaceColor,
                    boxShadow:
                      buttonVariant === "soft"
                        ? `inset 0 0 0 999px color-mix(in srgb, ${primaryColor} 20%, ${surfaceColor})`
                        : "none",
                  }}
                >
                  RSVP now
                </span>
                <span
                  className="inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-semibold"
                  style={{
                    backgroundColor: "transparent",
                    border: `1px solid ${accentColor}`,
                    color: accentColor,
                  }}
                >
                  View events
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              {[primaryColor, accentColor, textColor].map((color) => (
                <div
                  key={color}
                  className="rounded-2xl border border-black/5 p-3 text-center text-xs font-semibold"
                  style={{ backgroundColor: surfaceColor, color: mutedColor }}
                >
                  <span
                    className="mx-auto mb-2 block h-8 w-8 rounded-full border border-black/10"
                    style={{ backgroundColor: color }}
                  />
                  {color.toUpperCase()}
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-3 text-sm" style={{ color: mutedColor }}>
              <p>
                Button style: <span style={{ color: textColor }}>{buttonVariantLabels[buttonVariant] ?? buttonVariant}</span>
              </p>
              <p>
                Shadow: <span style={{ color: textColor }}>{shadowStyleLabels[shadowStyle] ?? shadowStyle}</span>
              </p>
              <p>
                Typography:{" "}
                <span style={{ color: textColor }}>
                  {headingFontLabels[headingFontKey] ?? headingFontKey} + {bodyFontLabels[bodyFontKey] ?? bodyFontKey}
                </span>
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-[color:var(--muted)]">
          Selected template:{" "}
          <span className="font-semibold text-[color:var(--text)]">{selectedTemplate?.name}</span>
          <span className="ml-2 text-xs text-[color:var(--muted)]">
            Templates apply the moment you pick one — this saves your color &amp; typography tweaks.
          </span>
        </p>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save theme changes"}
        </Button>
      </div>

      {/* Floating unsaved-changes bar. The template itself now applies on click;
          this only appears for color/typography edits, which still need an
          explicit save. */}
      {isDirty && !isPending ? (
        <div className="fixed inset-x-4 bottom-4 z-40 sm:inset-x-auto sm:right-8 sm:w-96">
          <div className="flex items-center justify-between gap-3 rounded-3xl border border-amber-200 bg-amber-50 px-4 py-3 shadow-[0_16px_48px_rgba(43,26,24,0.18)]">
            <p className="text-sm font-medium text-amber-950">
              Unsaved color changes. Save to apply.
            </p>
            <Button type="submit" size="sm">
              Save now
            </Button>
          </div>
        </div>
      ) : null}
    </form>
  );
}
