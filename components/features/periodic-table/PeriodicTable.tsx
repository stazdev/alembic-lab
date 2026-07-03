"use client";

import { useState, type CSSProperties } from "react";
import {
  CATEGORY_META,
  ELEMENTS,
  type ElementCategory,
  type ElementDatum,
} from "@/data/elements";
import { ElementCell } from "./ElementCell";
import { CategoryLegend } from "./CategoryLegend";
import { ElementDetail } from "./ElementDetail";

// Grid geometry: elements sit directly on an 18-column grid by IUPAC group and
// period. Lanthanides/actinides are pulled into the strip (rows 9 / 10), aligned
// to start under group 3 (grid column 3).
function position(e: ElementDatum): CSSProperties {
  if (e.category === "lanthanide") return { gridColumn: e.z - 57 + 3, gridRow: 9 };
  if (e.category === "actinide") return { gridColumn: e.z - 89 + 3, gridRow: 10 };
  return { gridColumn: e.group, gridRow: e.period };
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
          className="grid min-w-[900px] gap-1"
          style={{ gridTemplateColumns: "repeat(18, minmax(0, 1fr))" }}
        >
          {/* f-block placeholder markers in the main body */}
          <PlaceholderCell
            style={{ gridColumn: 3, gridRow: 6 }}
            label="57–71"
            sub="La–Lu"
            category="lanthanide"
          />
          <PlaceholderCell
            style={{ gridColumn: 3, gridRow: 7 }}
            label="89–103"
            sub="Ac–Lr"
            category="actinide"
          />

          {/* Breathing room between the main table and the f-block strip */}
          <div style={{ gridColumn: "1 / -1", gridRow: 8, height: 10 }} />

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

      <ElementDetail element={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
