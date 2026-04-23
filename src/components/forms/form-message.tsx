import { cn } from "@/lib/utils";

export function FormMessage({
  type,
  message,
}: {
  type: "error" | "success";
  message?: string;
}) {
  if (!message) return null;

  return (
    <div
      className={cn(
        "rounded-2xl px-4 py-3 text-sm",
        type === "error"
          ? "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
          : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
      )}
    >
      {message}
    </div>
  );
}
