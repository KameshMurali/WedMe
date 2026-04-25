import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function toValidDate(value: Date | string) {
  const resolvedDate = typeof value === "string" ? new Date(value) : value;
  return Number.isNaN(resolvedDate.getTime()) ? null : resolvedDate;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions) {
  const resolvedDate = toValidDate(date);
  if (!resolvedDate) {
    return "Date to be announced";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    ...options,
  }).format(resolvedDate);
}

export function formatTimeRange(start: Date | string, end?: Date | string | null) {
  const format = (value: Date | string) => {
    const resolvedDate = toValidDate(value);
    if (!resolvedDate) {
      return null;
    }

    new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }).format(resolvedDate);
  };

  const startLabel = format(start);
  const endLabel = end ? format(end) : null;

  if (!startLabel) {
    return "Time to be announced";
  }

  return endLabel ? `${startLabel} - ${endLabel}` : startLabel;
}

export function formatEnumLabel(value: string | null | undefined, fallback = "Details") {
  return value ? value.replaceAll("_", " ") : fallback;
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
