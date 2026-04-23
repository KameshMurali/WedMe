import type { StorageDriver } from "@/server/storage/types";

export const s3StorageDriver: StorageDriver = {
  async upload() {
    throw new Error("S3 storage is not configured yet. Set STORAGE_DRIVER=local for local development.");
  },
  async remove() {
    throw new Error("S3 storage is not configured yet. Set STORAGE_DRIVER=local for local development.");
  },
};
