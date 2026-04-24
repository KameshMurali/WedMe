import { env } from "@/lib/env";
import { blobStorageDriver } from "@/server/storage/blob-storage";
import { localStorageDriver } from "@/server/storage/local-storage";
import { s3StorageDriver } from "@/server/storage/s3-storage";

if (process.env.NODE_ENV === "production" && process.env.VERCEL && env.STORAGE_DRIVER === "local") {
  console.warn(
    "STORAGE_DRIVER=local on Vercel will not keep uploads permanently. Use STORAGE_DRIVER=blob or STORAGE_DRIVER=s3 in production.",
  );
}

export const storage =
  env.STORAGE_DRIVER === "blob"
    ? blobStorageDriver
    : env.STORAGE_DRIVER === "s3"
      ? s3StorageDriver
      : localStorageDriver;
