import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

import { env } from "@/lib/env";
import { createPublicUrl } from "@/lib/utils";
import type { StorageDriver, StorageUploadInput } from "@/server/storage/types";

async function ensureFolder(relativeFolder: string) {
  const absoluteFolder = path.join(process.cwd(), env.LOCAL_UPLOAD_DIR, relativeFolder);
  await fs.mkdir(absoluteFolder, { recursive: true });
  return absoluteFolder;
}

export const localStorageDriver: StorageDriver = {
  async upload(input: StorageUploadInput) {
    const folder = await ensureFolder(input.folder);
    const extension = path.extname(input.filename) || ".bin";
    const fileName = `${Date.now()}-${crypto.randomUUID()}${extension}`;
    const absolutePath = path.join(folder, fileName);

    await fs.writeFile(absolutePath, input.buffer);

    const relativeStorageKey = path.posix.join(input.folder, fileName);
    return {
      storageKey: relativeStorageKey,
      url: createPublicUrl(path.posix.join("uploads", relativeStorageKey)),
    };
  },
  async remove(storageKey: string) {
    const absolutePath = path.join(process.cwd(), env.LOCAL_UPLOAD_DIR, storageKey);
    await fs.rm(absolutePath, { force: true });
  },
};
