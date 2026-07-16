import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  variant?: "solid" | "outline" | "ghost" | "secondary";
  size?: "sm" | "md" | "lg";
};

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  solid:
    "bg-[var(--primary)] text-white shadow-glow hover:bg-[color:var(--accent)] hover:text-ink",
  outline:
    "border border-[color:var(--primary)]/20 bg-white/70 text-[color:var(--text)] hover:border-[color:var(--accent)] hover:bg-white",
  ghost: "bg-transparent text-[color:var(--text)] hover:bg-white/70",
  secondary:
    "bg-[color:var(--surface)] text-[color:var(--text)] ring-1 ring-black/5 hover:bg-white",
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
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60",
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
