"use client";

import { useRef, type KeyboardEvent } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Unique id so multiple controls animate independently. */
  layoutId: string;
  "aria-label"?: string;
  className?: string;
}

/**
 * Accessible pill segmented control — replaces a native <select> (§4.5).
 * Roving tabindex + arrow-key navigation; a shared-layout indicator slides
 * under the active option.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  layoutId,
  "aria-label": ariaLabel,
  className,
}: SegmentedControlProps<T>) {
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  function focusAndSelect(index: number) {
    const next = (index + options.length) % options.length;
    onChange(options[next].value);
    buttons.current[next]?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        focusAndSelect(index + 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        focusAndSelect(index - 1);
        break;
      case "Home":
        event.preventDefault();
        focusAndSelect(0);
        break;
      case "End":
        event.preventDefault();
        focusAndSelect(options.length - 1);
        break;
    }
  }

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      aria-orientation="horizontal"
      className={cn(
        "inline-flex items-center gap-1 rounded-pill bg-surface-2 p-1",
        className,
      )}
    >
      {options.map((option, index) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            ref={(el) => {
              buttons.current[index] = el;
            }}
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={(event) => onKeyDown(event, index)}
            className={cn(
              "relative rounded-pill px-4 py-2 text-sm font-medium transition-colors",
              active ? "text-ink" : "text-ink-2 hover:text-ink",
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-pill bg-surface shadow-soft"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            <span className="relative z-10">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
