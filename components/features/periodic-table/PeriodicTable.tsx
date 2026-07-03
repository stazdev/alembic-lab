"use client";

import {
  useMemo,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import {
  CATEGORY_META,
  ELEMENT_BY_Z,
  ELEMENTS,
  type ElementCategory,
  type ElementDatum,
} from "@/data/elements";
import { SearchField } from "@/components/ui/SearchField";
import { cn } from "@/lib/utils";
import { ElementCell } from "./ElementCell";
import { CategoryLegend } from "./CategoryLegend";
import { ElementDetail } from "./ElementDetail";

// Numeric properties available for the trend / heatmap view.
const HEATMAP_PROPS = [
  { key: "electronegativity", label: "Electronegativity", unit: "" },
  { key: "atomicRadius", label: "Atomic radius", unit: "pm" },
  { key: "ionizationEnergy", label: "Ionization energy", unit: "kJ/mol" },
  { key: "meltingPoint", label: "Melting point", unit: "K" },
  { key: "density", label: "Density", unit: "g/cm³" },
] as const;

type HeatKey = (typeof HEATMAP_PROPS)[number]["key"];
type ColorBy = "category" | HeatKey;

const NO_DATA = "#e6e2d7";
const LOW: [number, number, number] = [246, 241, 226];
const HIGH: [number, number, number] = [176, 125, 26];

const clamp01 = (t: number) => Math.max(0, Math.min(1, t));

function heat(t: number): string {
  const [r, g, b] = LOW.map((lo, i) => Math.round(lo + (HIGH[i] - lo) * clamp01(t)));
  return `rgb(${r}, ${g}, ${b})`;
}

function fmtNum(n: number): string {
  if (Math.abs(n) >= 100) return String(Math.round(n));
  return n.toFixed(2).replace(/\.?0+$/, "");
}

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

function ColorByPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-pill px-3 py-1.5 text-xs font-medium transition",
        active
          ? "bg-ink text-on-dark"
          : "border border-line bg-surface text-ink-2 hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

function HeatmapLegend({
  label,
  unit,
  min,
  max,
}: {
  label: string;
  unit: string;
  min: number;
  max: number;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
      <div className="flex items-center gap-2.5">
        <span className="text-xs font-medium text-ink-2">
          {label}
          {unit ? ` (${unit})` : ""}
        </span>
        <span className="text-[11px] tabular-nums text-ink-3">{fmtNum(min)}</span>
        <span
          className="h-3 w-40 rounded-full ring-1 ring-black/5"
          style={{ background: `linear-gradient(to right, ${heat(0)}, ${heat(1)})` }}
        />
        <span className="text-[11px] tabular-nums text-ink-3">{fmtNum(max)}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span
          className="h-3.5 w-3.5 rounded-[5px] ring-1 ring-black/5"
          style={{ backgroundColor: NO_DATA }}
        />
        <span className="text-[11px] text-ink-3">no data</span>
      </div>
    </div>
  );
}

export function PeriodicTable() {
  const [hovered, setHovered] = useState<ElementDatum | null>(null);
  const [selected, setSelected] = useState<ElementDatum | null>(null);
  const [colorBy, setColorBy] = useState<ColorBy>("category");
  const [query, setQuery] = useState("");

  const activeProp =
    colorBy === "category"
      ? null
      : HEATMAP_PROPS.find((p) => p.key === colorBy) ?? null;

  const range = useMemo(() => {
    if (!activeProp) return { min: 0, max: 0 };
    const vals = ELEMENTS.map((e) => e[activeProp.key]).filter(
      (v): v is number => v != null,
    );
    if (vals.length === 0) return { min: 0, max: 0 };
    return { min: Math.min(...vals), max: Math.max(...vals) };
  }, [activeProp]);

  const q = query.trim().toLowerCase();
  const matches = (e: ElementDatum): boolean =>
    !q ||
    e.name.toLowerCase().includes(q) ||
    e.symbol.toLowerCase().includes(q) ||
    String(e.z).includes(q);

  const fillFor = (e: ElementDatum): string => {
    if (!activeProp) return CATEGORY_META[e.category].fill;
    const v = e[activeProp.key];
    if (v == null) return NO_DATA;
    const { min, max } = range;
    return heat(max > min ? (v - min) / (max - min) : 0.5);
  };

  const noteFor = (e: ElementDatum): string | undefined => {
    if (!activeProp) return undefined;
    const v = e[activeProp.key];
    if (v == null) return `${activeProp.label}: no data`;
    return `${activeProp.label}: ${fmtNum(v)}${activeProp.unit ? ` ${activeProp.unit}` : ""}`;
  };

  // Arrow-key navigation across the grid: ←/→ step by atomic number, ↑/↓ move
  // within a group. Enter/Space (native button behavior) opens the drawer.
  const onGridKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) return;
    const zAttr = document.activeElement?.getAttribute("data-z");
    if (!zAttr) return;
    const el = ELEMENT_BY_Z[Number(zAttr)];
    if (!el) return;
    let target: ElementDatum | undefined;
    if (e.key === "ArrowLeft") target = ELEMENT_BY_Z[el.z - 1];
    else if (e.key === "ArrowRight") target = ELEMENT_BY_Z[el.z + 1];
    else if (e.key === "ArrowUp")
      target = ELEMENTS.find((o) => o.group === el.group && o.period === el.period - 1);
    else
      target = ELEMENTS.find((o) => o.group === el.group && o.period === el.period + 1);
    if (target) {
      e.preventDefault();
      document.getElementById(`ptable-el-${target.z}`)?.focus();
    }
  };

  return (
    <div>
      {/* Controls: color mode + search */}
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div data-tour="ptable-colorby" className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs font-medium text-ink-2">Color by</span>
          <ColorByPill
            active={colorBy === "category"}
            onClick={() => setColorBy("category")}
          >
            Category
          </ColorByPill>
          {HEATMAP_PROPS.map((p) => (
            <ColorByPill
              key={p.key}
              active={colorBy === p.key}
              onClick={() => setColorBy(p.key)}
            >
              {p.label}
            </ColorByPill>
          ))}
        </div>
        <div data-tour="ptable-search">
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder="Search element…"
            className="lg:w-64"
          />
        </div>
      </div>

      {/* Grid */}
      <div data-tour="ptable-grid" className="overflow-x-auto pb-2">
        <div
          role="group"
          aria-label="Periodic table of the elements"
          onKeyDown={onGridKeyDown}
          className="grid min-w-[900px] gap-1"
          style={{ gridTemplateColumns: "repeat(18, minmax(0, 1fr))" }}
        >
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

          {ELEMENTS.map((el) => (
            <ElementCell
              key={el.z}
              el={el}
              fill={fillFor(el)}
              note={noteFor(el)}
              style={position(el)}
              selected={selected?.z === el.z}
              dimmed={!matches(el)}
              onHover={setHovered}
              onSelect={setSelected}
            />
          ))}
        </div>
      </div>

      {/* Legend: category swatches or the heatmap scale */}
      <div data-tour="ptable-legend" className="mt-6">
        {activeProp ? (
          <HeatmapLegend
            label={activeProp.label}
            unit={activeProp.unit}
            min={range.min}
            max={range.max}
          />
        ) : (
          <CategoryLegend activeCategory={hovered?.category ?? null} />
        )}
      </div>

      <ElementDetail element={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
