import "server-only";

import { env } from "@/lib/env";

export const directBlobUploadsEnabled = env.STORAGE_DRIVER === "blob" && Boolean(env.BLOB_READ_WRITE_TOKEN);
