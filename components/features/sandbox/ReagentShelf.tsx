"use client";

import { REAGENTS } from "@/lib/chemistry/reagents";
import { useSandbox } from "@/lib/stores/sandboxStore";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { cn } from "@/lib/utils";

const ELEMENT_TEASER = ["H", "O", "Na", "Cl", "Cu"];

export function ReagentShelf() {
  const selectedId = useSandbox((s) => s.selectedVesselId);
  const addReagent = useSandbox((s) => s.addReagent);
  const disabled = selectedId == null;

  return (
    <Card className="p-5">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-base font-semibold text-ink">Reagent Shelf</h2>
        <Pill tone={disabled ? "outline" : "soft"}>
          {disabled ? "Select a vessel" : "Tap to add"}
        </Pill>
      </div>
      <p className="mb-4 text-xs text-ink-2">
        Each reagent is added to the selected vessel in a fixed aliquot.
      </p>

      <div className="max-h-[360px] overflow-y-auto pr-1">
        <div className="grid grid-cols-2 gap-2">
          {REAGENTS.map((reagent) => (
            <button
              key={reagent.id}
              type="button"
              disabled={disabled}
              onClick={() => selectedId && addReagent(selectedId, reagent.id)}
              className={cn(
                "flex items-center gap-2.5 rounded-ctrl border border-line bg-surface px-3 py-2.5 text-left transition",
                "hover:border-line-strong hover:bg-surface-2 active:scale-[0.98]",
                "disabled:pointer-events-none disabled:opacity-40",
              )}
            >
              <span
                className="h-6 w-6 shrink-0 rounded-full border border-black/5"
                style={{ backgroundColor: reagent.color }}
              />
              <span className="min-w-0">
                <span className="block truncate text-xs font-semibold text-ink">
                  {reagent.name}
                </span>
                <span className="block truncate text-[11px] text-ink-3">
                  {reagent.formula}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Planned: an Elements shelf that ties into the periodic table (Module 3). */}
      <div className="mt-4 rounded-ctrl border border-dashed border-line-strong p-3">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-xs font-semibold text-ink">Elements</span>
          <Pill tone="outline">Coming soon</Pill>
        </div>
        <p className="mb-2.5 text-[11px] leading-relaxed text-ink-2">
          Pull elements from the periodic table to build your own compounds.
        </p>
        <div className="flex gap-1.5">
          {ELEMENT_TEASER.map((symbol) => (
            <span
              key={symbol}
              className="grid h-7 w-7 place-items-center rounded-md bg-surface-2 text-[11px] font-semibold text-ink-3"
            >
              {symbol}
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
}
