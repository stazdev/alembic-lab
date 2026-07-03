import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Tone = "surface" | "cream" | "dark";

const TONES: Record<Tone, string> = {
  surface: "bg-surface text-ink",
  cream: "bg-surface-2 text-ink",
  dark: "bg-dark text-on-dark",
};

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  tone?: Tone;
  /** Drop the soft shadow (e.g. for nested cards). */
  flat?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, tone = "surface", flat = false, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-card",
        TONES[tone],
        !flat && "shadow-soft",
        className,
      )}
      {...props}
    />
  );
});
