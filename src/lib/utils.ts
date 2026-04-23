import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions) {
  const resolvedDate = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    ...options,
  }).format(resolvedDate);
}

export function formatTimeRange(start: Date | string, end?: Date | string | null) {
  const format = (value: Date | string) =>
    new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }).format(typeof value === "string" ? new Date(value) : value);

  return end ? `${format(start)} - ${format(end)}` : format(start);
}

export function createPublicUrl(path: string) {
  return path.startsWith("/") ? path : `/${path}`;
}

export function bytesToSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function groupBy<T, K extends string | number>(
  list: T[],
  getKey: (item: T) => K,
) {
  return list.reduce(
    (accumulator, item) => {
      const key = getKey(item);
      accumulator[key] ??= [];
      accumulator[key].push(item);
      return accumulator;
    },
    {} as Record<K, T[]>,
  );
}
