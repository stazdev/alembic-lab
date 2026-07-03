"use client";

import { useState, type CSSProperties } from "react";
import {
  CATEGORY_META,
  ELEMENTS,
  type ElementCategory,
  type ElementDatum,
} from "@/data/elements";
import { cn } from "@/lib/utils";
import { ElementCell } from "./ElementCell";
import { CategoryLegend } from "./CategoryLegend";

const GROUPS = Array.from({ length: 18 }, (_, i) => i + 1);
const PERIODS = [1, 2, 3, 4, 5, 6, 7];

// Grid geometry: column 1 is the period-label gutter, so an element in IUPAC
// group g sits in grid column g + 1; row 1 is the group-number header, so period
// p sits in grid row p + 1. Lanthanides/actinides are pulled into the strip
// (rows 10 / 11), aligned to start under group 3 (grid column 4).
function position(e: ElementDatum): CSSProperties {
  if (e.category === "lanthanide") return { gridColumn: e.z - 57 + 4, gridRow: 10 };
  if (e.category === "actinide") return { gridColumn: e.z - 89 + 4, gridRow: 11 };
  return { gridColumn: e.group + 1, gridRow: e.period + 1 };
}

/** The f-block markers left in the main body at the La / Ac positions. */
function PlaceholderCell({
  style,
  label,
  sub,
  category,
}: {
  style: CSSProperties;
  label: string;
  sub: string;
  category: ElementCategory;
}) {
  return (
    <div
      style={{ ...style, backgroundColor: CATEGORY_META[category].fill }}
      className="flex aspect-square flex-col items-center justify-center rounded-[10px] p-1 text-center opacity-70"
      aria-hidden
    >
      <span className="text-[11px] font-semibold leading-none text-ink">
        {label}
      </span>
      <span className="mt-0.5 text-[8px] leading-tight text-ink-2">{sub}</span>
    </div>
  );
}

export function PeriodicTable() {
  const [hovered, setHovered] = useState<ElementDatum | null>(null);
  const [selected, setSelected] = useState<ElementDatum | null>(null);

  return (
    <div>
      <div className="overflow-x-auto pb-2">
        <div
          role="group"
          aria-label="Periodic table of the elements"
          className="grid min-w-[980px] gap-1"
          style={{ gridTemplateColumns: "auto repeat(18, minmax(0, 1fr))" }}
        >
          {/* Group-number headers (row 1) */}
          {GROUPS.map((g) => (
            <div
              key={`grp-${g}`}
              style={{ gridColumn: g + 1, gridRow: 1 }}
              className={cn(
                "flex items-end justify-center pb-1 text-[11px] font-medium tabular-nums transition-colors",
                hovered?.group === g ? "text-ink" : "text-ink-3",
              )}
            >
              {g}
            </div>
          ))}

          {/* Period-number gutter (column 1) */}
          {PERIODS.map((p) => (
            <div
              key={`per-${p}`}
              style={{ gridColumn: 1, gridRow: p + 1 }}
              className={cn(
                "flex items-center justify-center pr-1.5 text-[11px] font-medium tabular-nums transition-colors",
                hovered?.period === p ? "text-ink" : "text-ink-3",
              )}
            >
              {p}
            </div>
          ))}

          {/* f-block placeholder markers in the main body */}
          <PlaceholderCell
            style={{ gridColumn: 4, gridRow: 7 }}
            label="57–71"
            sub="La–Lu"
            category="lanthanide"
          />
          <PlaceholderCell
            style={{ gridColumn: 4, gridRow: 8 }}
            label="89–103"
            sub="Ac–Lr"
            category="actinide"
          />

          {/* Breathing room between the main table and the f-block strip */}
          <div style={{ gridColumn: "1 / -1", gridRow: 9, height: 10 }} />

          {/* Elements */}
          {ELEMENTS.map((el) => (
            <ElementCell
              key={el.z}
              el={el}
              style={position(el)}
              selected={selected?.z === el.z}
              onHover={setHovered}
              onSelect={setSelected}
            />
          ))}
        </div>
      </div>

      <div className="mt-6">
        <CategoryLegend activeCategory={hovered?.category ?? null} />
      </div>
    </div>
  );
}
