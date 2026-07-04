"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { CATEGORY_META, type ElementDatum } from "@/data/elements";
import { electronConfiguration } from "@/lib/chemistry/electronConfig";
import { AtomicModel3D } from "./AtomicModel3D";
import { ElementInsights } from "./ElementInsights";

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-ctrl bg-surface-2 px-3 py-2.5">
      <div className="text-[11px] font-medium uppercase tracking-wide text-ink-3">
        {label}
      </div>
      <div className="mt-0.5 text-sm font-semibold text-ink">{value}</div>
    </div>
  );
}

function PropRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <dt className="text-xs text-ink-2">{label}</dt>
      <dd className="text-sm font-medium tabular-nums text-ink">{value}</dd>
    </div>
  );
}

const capitalize = (s: string): string =>
  s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Slide-in detail drawer for a selected element: identity, key facts, electron
 * shells + configuration, and an interactive 3D Bohr atomic model. Closes on the
 * backdrop, the X button, or Escape.
 */
export function ElementDetail({
  element,
  onClose,
}: {
  element: ElementDatum | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!element) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [element, onClose]);

  const cfg = element ? electronConfiguration(element.z) : null;
  const meta = element ? CATEGORY_META[element.category] : null;
  // Elements 104+ are synthetic superheavies: some properties genuinely have no
  // established value even in the literature — show that plainly, not a bare dash.
  const predicted = !!element && element.z >= 104;
  const pv = (v: number | null, unit?: string): string =>
    v == null ? (predicted ? "Not established" : "—") : `${v}${unit ? ` ${unit}` : ""}`;

  return (
    <AnimatePresence>
      {element &&
        cfg &&
        meta && [
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-40 bg-ink/25 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />,
          <motion.aside
            key="panel"
            aria-label={`${element.name} details`}
            className="fixed inset-4 z-50 flex flex-col overflow-y-auto rounded-card border border-line bg-surface shadow-lift sm:left-auto sm:w-full sm:max-w-md"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
          >
            {/* Header: category chip + close */}
            <div className="flex items-start justify-between gap-3 p-5">
              <span
                className="inline-flex items-center rounded-pill px-3 py-1 text-xs font-semibold text-ink"
                style={{ backgroundColor: meta.fill }}
              >
                {meta.label}
              </span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="inline-flex h-9 w-9 items-center justify-center rounded-pill border border-line bg-surface text-ink-2 transition hover:bg-surface-2 hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Identity */}
            <div className="px-5">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <div className="text-sm font-medium tabular-nums text-ink-2">
                    {element.z}
                  </div>
                  <div className="text-6xl font-bold leading-none text-ink">
                    {element.symbol}
                  </div>
                  <div className="mt-2 text-lg font-semibold text-ink">
                    {element.name}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-ink-3">Atomic mass</div>
                  <div className="text-lg font-semibold tabular-nums text-ink">
                    {element.mass.toFixed(3)}
                  </div>
                  <div className="text-xs text-ink-3">g/mol</div>
                </div>
              </div>
            </div>

            {/* 3D atomic model */}
            <div className="mt-4 px-5">
              <div className="relative h-64 overflow-hidden rounded-card border border-line bg-surface-2">
                <AtomicModel3D shells={cfg.shells} color={meta.fill} />
                <div className="pointer-events-none absolute inset-x-0 bottom-2 text-center text-[11px] text-ink-3">
                  Bohr model · drag to rotate
                </div>
              </div>
            </div>

            {/* Key facts */}
            <div className="mt-4 grid grid-cols-2 gap-2 px-5">
              <Fact label="Group" value={String(element.group)} />
              <Fact label="Period" value={String(element.period)} />
              <Fact label="Block" value={`${element.block}-block`} />
              <Fact label="Valence e⁻" value={String(cfg.valence)} />
            </div>

            {/* Physical properties */}
            <div className="mt-5 px-5">
              <div className="text-[11px] font-medium uppercase tracking-wide text-ink-3">
                Physical properties
              </div>
              {predicted && (
                <p className="mt-1.5 text-[11px] leading-relaxed text-ink-3">
                  Synthetic superheavy element — most values are{" "}
                  <span className="font-medium text-ink-2">predicted</span>, not
                  measured. A few (electronegativity, some phase points) have no
                  established value even in the literature.
                </p>
              )}
              <dl className="mt-2 divide-y divide-line rounded-ctrl bg-surface-2 px-3">
                <PropRow
                  label="Standard state"
                  value={
                    element.standardState === "unknown"
                      ? predicted
                        ? "Not established"
                        : "Unknown"
                      : capitalize(element.standardState)
                  }
                />
                <PropRow
                  label="Electronegativity"
                  value={pv(element.electronegativity)}
                />
                <PropRow label="Atomic radius" value={pv(element.atomicRadius, "pm")} />
                <PropRow
                  label="Ionization energy"
                  value={pv(element.ionizationEnergy, "kJ/mol")}
                />
                <PropRow label="Melting point" value={pv(element.meltingPoint, "K")} />
                <PropRow label="Boiling point" value={pv(element.boilingPoint, "K")} />
                <PropRow label="Density" value={pv(element.density, "g/cm³")} />
              </dl>
            </div>

            {/* Electron shells */}
            <div className="mt-5 px-5">
              <div className="text-[11px] font-medium uppercase tracking-wide text-ink-3">
                Electron shells
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {cfg.shells.map((count, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 rounded-ctrl bg-surface-2 px-2.5 py-1"
                  >
                    <span className="text-[10px] text-ink-3">n{i + 1}</span>
                    <span className="text-sm font-semibold tabular-nums text-ink">
                      {count}
                    </span>
                  </span>
                ))}
              </div>
            </div>

            {/* Electron configuration */}
            <div className="mt-5 px-5 pb-6">
              <div className="text-[11px] font-medium uppercase tracking-wide text-ink-3">
                Electron configuration
              </div>
              <div className="mt-2 rounded-ctrl bg-surface-2 px-3 py-2.5">
                <div className="font-mono text-sm text-ink">{cfg.noble}</div>
                <div className="mt-1 font-mono text-xs leading-relaxed text-ink-3">
                  {cfg.notation}
                </div>
              </div>
            </div>

            {/* AI insights */}
            <div className="mt-5 px-5 pb-6">
              <ElementInsights element={element} />
            </div>
          </motion.aside>,
        ]}
    </AnimatePresence>
  );
}
