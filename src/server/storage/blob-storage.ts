import crypto from "node:crypto";
import path from "node:path";
import { del, put } from "@vercel/blob";

import { env } from "@/lib/env";
import { slugify } from "@/lib/utils";
import type { StorageDriver } from "@/server/storage/types";

function buildBlobPath(folder: string, filename: string) {
  const extension = path.extname(filename) || ".bin";
  const basename = path.basename(filename, extension);
  const safeName = slugify(basename) || "asset";
  return `${folder}/${Date.now()}-${safeName}-${crypto.randomUUID()}${extension}`;
}

export const blobStorageDriver: StorageDriver = {
  async upload(input) {
    const pathname = buildBlobPath(input.folder, input.filename);
    const blob = await put(pathname, input.buffer, {
      access: "public",
      addRandomSuffix: false,
      contentType: input.mimeType,
      token: env.BLOB_READ_WRITE_TOKEN,
    });

    return {
      storageKey: pathname,
      url: blob.url,
    };
  },
  async remove(storageKey) {
    await del(storageKey, {
      token: env.BLOB_READ_WRITE_TOKEN,
    });
  },
};
