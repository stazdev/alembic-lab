"use client";

import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchField({
  value,
  onChange,
  placeholder = "Search…",
  className,
}: SearchFieldProps) {
  return (
    <div
      className={cn(
        "flex h-11 items-center gap-2.5 rounded-pill border border-line bg-surface px-4 transition focus-within:border-line-strong focus-within:shadow-soft",
        className,
      )}
    >
      <Search className="h-4 w-4 shrink-0 text-ink-3" aria-hidden />
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full bg-transparent text-sm text-ink placeholder:text-ink-3 focus:outline-none"
      />
      {value.length > 0 && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="grid h-5 w-5 shrink-0 place-items-center rounded-full text-ink-3 transition hover:bg-surface-2 hover:text-ink"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
