"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const ERR = "#c0492e";

interface AddSpeciesInputProps {
  /** Add the value; return an error message to display, or null on success. */
  onAdd: (value: string) => string | null;
  placeholder: string;
  className?: string;
}

/** Shared "type a species/ion and add it" input used by the balancers. */
export function AddSpeciesInput({ onAdd, placeholder, className }: AddSpeciesInputProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const err = onAdd(value);
        if (err) setError(err);
        else {
          setValue("");
          setError(null);
        }
      }}
      className="flex flex-col gap-1"
    >
      <div
        className={cn(
          "flex h-11 items-center gap-1 rounded-ctrl border border-dashed border-line-strong bg-surface px-2 transition focus-within:border-ink-2",
          className,
        )}
      >
        <input
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError(null);
          }}
          placeholder={placeholder}
          aria-label={placeholder}
          className="h-10 w-28 bg-transparent text-sm text-ink placeholder:text-ink-3 focus:outline-none"
        />
        <button
          type="submit"
          aria-label="Add"
          className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ink text-on-dark transition hover:bg-dark-2"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
      {error && (
        <span className="text-[11px]" style={{ color: ERR }}>
          {error}
        </span>
      )}
    </form>
  );
}
