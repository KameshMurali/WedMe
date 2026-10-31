import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  variant?: "solid" | "outline" | "ghost" | "secondary";
  size?: "sm" | "md" | "lg";
};

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  // --primary-ink is published by site-shell from the template's own primary
  // luminance; the fallback keeps the marketing pages, which have no shell, on
  // white against their deep brown primary.
  solid:
    "bg-[var(--primary)] text-[color:var(--primary-ink,#ffffff)] shadow-glow hover:bg-[color:var(--accent)] hover:text-ink",
  // These three used to fill with literal white. That was invisible while every
  // page was cream, and it breaks the moment a button sits in a dark scope: a
  // white fill under --text, which is near-white there, is 1.8:1. Filling from
  // --surface instead makes the variant follow whatever scope it lands in, and
  // on a light page --surface is #fbfafd, so nothing visibly changes there.
  outline:
    "border border-[color:var(--primary)]/20 bg-[color:var(--surface)]/70 text-[color:var(--text)] hover:border-[color:var(--accent)] hover:bg-[color:var(--surface)]",
  ghost: "bg-transparent text-[color:var(--text)] hover:bg-[color:var(--surface)]/70",
  secondary:
    "bg-[color:var(--surface)] text-[color:var(--text)] ring-1 ring-[color:var(--border)] hover:bg-[color:var(--elevated)]",
};

const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "h-10 px-4 text-sm",
  md: "h-11 px-5 text-sm sm:text-[15px]",
  lg: "h-12 px-6 text-[15px]",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ asChild, className, variant = "solid", size = "md", type = "button", ...props }, ref) => {
    const Component = asChild ? Slot : "button";

    return (
      <Component
        ref={ref}
        {...(!asChild ? { type } : {})}
        className={cn(
          // focus-visible ring is intentional + offset so the default browser
          // outline (which doesn't follow rounded-full geometry and reads as a
          // ghost second pill, especially while disabled) is replaced with a
          // clean ring that matches the design system.
          // -webkit-tap-highlight-color:transparent + select-none stop iOS
          // Safari from leaving a stuck grey/gold tap-highlight "ghost" shape
          // when a button becomes disabled during the same tap (e.g. entering a
          // "Saving…" state on submit).
          "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition duration-200 outline-none [-webkit-tap-highlight-color:transparent] focus-visible:ring-2 focus-visible:ring-[color:var(--primary)]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60",
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
