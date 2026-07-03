"use client";

import type { CSSProperties } from "react";
import { Tooltip } from "@/components/ui/Tooltip";
import { CATEGORY_META, type ElementDatum } from "@/data/elements";
import { cn } from "@/lib/utils";

interface ElementCellProps {
  el: ElementDatum;
  fill: string;
  style?: CSSProperties;
  selected?: boolean;
  dimmed?: boolean;
  note?: string;
  onHover: (el: ElementDatum | null) => void;
  onSelect: (el: ElementDatum) => void;
}

/**
 * A single periodic-table cell. Colored by category, lifts on hover, and shows
 * a custom quick-stats tooltip (never a native `title`). Placement onto the grid
 * is supplied by the parent via `style` (gridColumn / gridRow).
 */
export function ElementCell({
  el,
  fill,
  style,
  selected,
  dimmed,
  note,
  onHover,
  onSelect,
}: ElementCellProps) {
  const meta = CATEGORY_META[el.category];

  return (
    <Tooltip
      side="top"
      content={
        <div className="leading-snug">
          <div className="text-[13px] font-semibold text-on-dark">{el.name}</div>
          <div className="mt-0.5 text-on-dark-2">
            #{el.z} · {meta.label}
          </div>
          <div className="text-on-dark-2">{el.mass.toFixed(3)} g/mol</div>
          {note && <div className="mt-0.5 text-on-dark">{note}</div>}
        </div>
      }
    >
      <button
        type="button"
        id={`ptable-el-${el.z}`}
        data-z={el.z}
        style={{ ...style, backgroundColor: dimmed ? undefined : fill }}
        onPointerEnter={() => onHover(el)}
        onPointerLeave={() => onHover(null)}
        onFocus={() => onHover(el)}
        onBlur={() => onHover(null)}
        onClick={() => onSelect(el)}
        aria-label={`${el.name}, atomic number ${el.z}`}
        aria-pressed={selected}
        className={cn(
          "group relative flex aspect-square flex-col items-center justify-center rounded-[10px] p-1 text-ink transition duration-150",
          "hover:z-10 hover:-translate-y-0.5 hover:shadow-soft",
          "focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink",
          dimmed && "bg-surface-2 text-ink-3 opacity-40",
          selected &&
            "z-10 -translate-y-0.5 shadow-lift ring-2 ring-accent-strong ring-offset-1 ring-offset-bg",
        )}
      >
        <span className="absolute left-1 top-0.5 text-[9px] font-medium tabular-nums text-ink-2 group-hover:text-ink">
          {el.z}
        </span>
        <span className="text-[15px] font-bold leading-none lg:text-[17px]">
          {el.symbol}
        </span>
        <span className="mt-0.5 hidden w-full truncate text-center text-[8px] leading-tight text-ink-2 sm:block">
          {el.name}
        </span>
      </button>
    </Tooltip>
  );
}
