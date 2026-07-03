import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "surface" | "dark" | "accent" | "ghost";
type Size = "sm" | "md";

const VARIANTS: Record<Variant, string> = {
  surface: "bg-surface text-ink border border-line hover:bg-surface-2",
  dark: "bg-dark text-on-dark hover:bg-dark-2",
  accent: "bg-accent text-accent-ink hover:bg-accent-strong",
  ghost: "text-ink-2 hover:bg-surface-2 hover:text-ink",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 w-9",
  md: "h-11 w-11",
};

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** Required for accessibility on icon-only buttons. */
  "aria-label": string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    { className, variant = "surface", size = "md", type = "button", ...props },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-pill transition active:scale-95 disabled:pointer-events-none disabled:opacity-40",
          VARIANTS[variant],
          SIZES[size],
          className,
        )}
        {...props}
      />
    );
  },
);
