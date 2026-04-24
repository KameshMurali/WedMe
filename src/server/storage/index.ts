import { env } from "@/lib/env";
import { localStorageDriver } from "@/server/storage/local-storage";
import { s3StorageDriver } from "@/server/storage/s3-storage";

export const storage = env.STORAGE_DRIVER === "s3" ? s3StorageDriver : localStorageDriver;
