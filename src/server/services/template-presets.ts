import "server-only";

import type { Prisma } from "@prisma/client";

import { templateRegistry } from "@/lib/template-registry";
import { prisma } from "@/server/prisma";

type TemplatePresetClient = Pick<Prisma.TransactionClient, "templatePreset">;

export async function ensureTemplatePresets(client: TemplatePresetClient = prisma) {
  await Promise.all(
    templateRegistry.map((template) =>
      client.templatePreset.upsert({
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
      }),
    ),
  );
}
