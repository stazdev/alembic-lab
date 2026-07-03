import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "accent" | "soft" | "dark" | "outline";

const TONES: Record<Tone, string> = {
  neutral: "bg-surface-2 text-ink-2",
  accent: "bg-accent text-accent-ink",
  soft: "bg-accent-soft text-accent-ink",
  dark: "bg-dark text-on-dark",
  outline: "border border-line-strong text-ink-2",
};

export interface PillProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export function Pill({ className, tone = "neutral", ...props }: PillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill px-3 py-1 text-xs font-medium leading-none",
        TONES[tone],
        className,
      )}
      {...props}
    />
  );
}
