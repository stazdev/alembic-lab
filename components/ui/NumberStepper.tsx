"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "light" | "dark";

interface NumberStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  tone?: Tone;
  "aria-label"?: string;
  className?: string;
}

const TONES: Record<Tone, { wrap: string; btn: string; value: string }> = {
  light: {
    wrap: "bg-surface-2",
    btn: "text-ink-2 hover:bg-line/70 hover:text-ink",
    value: "text-ink",
  },
  dark: {
    wrap: "bg-dark-2",
    btn: "text-on-dark/75 hover:bg-white/10 hover:text-on-dark",
    value: "text-on-dark",
  },
};

/** Custom quantity stepper — replaces a native number input spinner (§4.5). */
export function NumberStepper({
  value,
  onChange,
  min = 0,
  max = 99,
  tone = "light",
  "aria-label": ariaLabel = "Quantity",
  className,
}: NumberStepperProps) {
  const styles = TONES[tone];
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center gap-1 rounded-pill p-1",
        styles.wrap,
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Decrease"
        className={cn(
          "grid h-7 w-7 place-items-center rounded-full transition disabled:pointer-events-none disabled:opacity-30",
          styles.btn,
        )}
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span
        aria-live="polite"
        className={cn(
          "min-w-[1.5rem] text-center text-sm font-semibold tabular-nums",
          styles.value,
        )}
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Increase"
        className={cn(
          "grid h-7 w-7 place-items-center rounded-full transition disabled:pointer-events-none disabled:opacity-30",
          styles.btn,
        )}
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
