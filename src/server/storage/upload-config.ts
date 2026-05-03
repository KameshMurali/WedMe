import "server-only";

import { env } from "@/lib/env";

export const directBlobUploadsEnabled = env.STORAGE_DRIVER === "blob" && Boolean(env.BLOB_READ_WRITE_TOKEN);

export const storageUploadsConfigured = env.STORAGE_DRIVER !== "blob" || Boolean(env.BLOB_READ_WRITE_TOKEN);

export const storageUploadsConfigurationMessage =
  env.STORAGE_DRIVER === "blob" && !env.BLOB_READ_WRITE_TOKEN
    ? "Uploads are not fully configured on this deployment yet. Add BLOB_READ_WRITE_TOKEN in Vercel to enable image uploads."
    : null;
