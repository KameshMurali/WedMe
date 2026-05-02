import "server-only";

import type { Prisma } from "@prisma/client";

import { findTemplateByKey, templateRegistry } from "@/lib/template-registry";
import { prisma } from "@/server/prisma";

type TemplatePresetClient = Pick<Prisma.TransactionClient, "templatePreset">;

export async function ensureTemplatePresetByKey(
  templateKey: string,
  client: TemplatePresetClient = prisma,
) {
  const template = findTemplateByKey(templateKey);

  return client.templatePreset.upsert({
    where: { key: template.key },
    update: {
      name: template.name,
      description: template.description,
      mood: template.mood,
      previewGradient: template.previewGradient,
      supportedSections: template.supportedSections,
      themeDefaults: template.themeDefaults,
    },
    create: {
      key: template.key,
      name: template.name,
      description: template.description,
      mood: template.mood,
      previewGradient: template.previewGradient,
      supportedSections: template.supportedSections,
      themeDefaults: template.themeDefaults,
    },
  });
}

export async function ensureTemplatePresets(client: TemplatePresetClient = prisma) {
  await Promise.all(templateRegistry.map((template) => ensureTemplatePresetByKey(template.key, client)));
}
