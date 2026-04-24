export type StorageUploadInput = {
  buffer: Buffer;
  filename: string;
  mimeType: string;
  folder: string;
};

export type StorageUploadResult = {
  url: string;
  storageKey: string;
};

export type StorageDriver = {
  upload(input: StorageUploadInput): Promise<StorageUploadResult>;
  remove(storageKey: string): Promise<void>;
};
