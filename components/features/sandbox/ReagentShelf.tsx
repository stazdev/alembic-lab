"use client";

import Link from "next/link";
import { REAGENTS } from "@/lib/chemistry/reagents";
import { useSandbox } from "@/lib/stores/sandboxStore";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { cn } from "@/lib/utils";

const COMPOUNDS = REAGENTS.filter((r) => r.role !== "metal");
const METALS = REAGENTS.filter((r) => r.role === "metal");

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
          {COMPOUNDS.map((reagent) => (
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

      {/* Elements: reactive metals demonstrate the reactivity series (ties to Module 3). */}
      <div className="mt-4 border-t border-line pt-4">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-xs font-semibold text-ink">Elements · metals</span>
          <Link
            href="/periodic-table"
            className="text-[11px] font-medium text-ink-2 transition hover:text-ink"
          >
            Periodic table →
          </Link>
        </div>
        <p className="mb-2.5 text-[11px] leading-relaxed text-ink-2">
          Drop a metal into acid or water — reactivity follows the periodic
          table. Na &amp; Ca react with water; Mg, Zn &amp; Fe with acid; Cu with
          neither.
        </p>
        <div className="grid grid-cols-3 gap-2">
          {METALS.map((metal) => (
            <button
              key={metal.id}
              type="button"
              disabled={disabled}
              onClick={() => selectedId && addReagent(selectedId, metal.id)}
              title={metal.name}
              className={cn(
                "flex items-center gap-2 rounded-ctrl border border-line bg-surface px-2 py-1.5 text-left transition",
                "hover:border-line-strong hover:bg-surface-2 active:scale-[0.98]",
                "disabled:pointer-events-none disabled:opacity-40",
              )}
            >
              <span
                className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-[11px] font-bold text-ink"
                style={{ backgroundColor: metal.color }}
              >
                {metal.formula}
              </span>
              <span className="min-w-0 truncate text-[11px] font-medium text-ink-2">
                {metal.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
}
