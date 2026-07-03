import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "accent" | "soft" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-ink text-on-dark hover:bg-dark-2",
  accent: "bg-accent text-accent-ink hover:bg-accent-strong",
  soft: "bg-surface-2 text-ink border border-line hover:bg-line/60",
  outline: "border border-line-strong text-ink hover:bg-surface-2",
  ghost: "text-ink-2 hover:bg-surface-2 hover:text-ink",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm gap-1.5",
  md: "h-11 px-5 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "md", type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex select-none items-center justify-center rounded-pill font-medium transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    />
  );
});
