"use client";

import { cn } from "@/lib/utils";

interface FieldProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  unit?: string;
  placeholder?: string;
  inputMode?: "decimal" | "text";
  invalid?: boolean;
  "aria-label"?: string;
  className?: string;
}

/** Labeled input with an optional unit suffix. Fully styled (§4.5). */
export function Field({
  label,
  value,
  onChange,
  unit,
  placeholder,
  inputMode = "text",
  invalid,
  "aria-label": ariaLabel,
  className,
}: FieldProps) {
  return (
    <label className={cn("block", className)}>
      {label && (
        <span className="mb-1 block text-xs font-medium text-ink-2">{label}</span>
      )}
      <div
        className={cn(
          "flex items-center rounded-ctrl border bg-surface px-3 transition focus-within:border-ink-2",
          invalid ? "border-[#c0492e]" : "border-line",
        )}
      >
        <input
          inputMode={inputMode}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label={ariaLabel ?? label}
          className="h-11 w-full bg-transparent text-sm text-ink placeholder:text-ink-3 focus:outline-none"
        />
        {unit && <span className="ml-2 shrink-0 text-xs text-ink-3">{unit}</span>}
      </div>
    </label>
  );
}
