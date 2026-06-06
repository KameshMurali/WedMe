import * as React from "react";

import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "min-h-[120px] w-full rounded-[1.35rem] border border-black/10 bg-white/85 px-4 py-3 text-sm outline-none transition placeholder:text-stone-400 focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent)]/20 aria-[invalid=true]:border-rose-400 aria-[invalid=true]:bg-rose-50 aria-[invalid=true]:text-rose-950 aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-rose-200 focus:aria-[invalid=true]:border-rose-500 focus:aria-[invalid=true]:ring-rose-200",
      className,
    )}
    {...props}
  />
));

Textarea.displayName = "Textarea";
