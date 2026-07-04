"use client";

import Link from "next/link";
import { Droplet } from "lucide-react";
import { REAGENTS, type Reagent } from "@/lib/chemistry/reagents";
import { useSandbox } from "@/lib/stores/sandboxStore";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { cn } from "@/lib/utils";

const WATER = REAGENTS.find((r) => r.id === "water")!;
const GROUPS: { label: string; items: Reagent[] }[] = [
  { label: "Acids", items: REAGENTS.filter((r) => r.role === "acid") },
  { label: "Bases", items: REAGENTS.filter((r) => r.role === "base") },
  { label: "Salts", items: REAGENTS.filter((r) => r.role === "salt") },
  { label: "Indicators", items: REAGENTS.filter((r) => r.role === "indicator") },
];
const METALS = REAGENTS.filter((r) => r.role === "metal");

export function ReagentShelf() {
  const selectedId = useSandbox((s) => s.selectedVesselId);
  const addReagent = useSandbox((s) => s.addReagent);
  const disabled = selectedId == null;

  const add = (id: string) => selectedId && addReagent(selectedId, id);

  return (
    <Card className="p-5">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-base font-semibold text-ink">Reagent Shelf</h2>
        <Pill tone={disabled ? "outline" : "soft"}>
          {disabled ? "Select a vessel" : "Tap to add"}
        </Pill>
      </div>
      <p className="mb-3 text-xs text-ink-2">
        Anything you add reacts from first principles — solubility rules and the
        reactivity series, not a fixed script.
      </p>

      {/* Water — the solvent, front and centre */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => add(WATER.id)}
        className={cn(
          "mb-3 flex w-full items-center gap-2.5 rounded-ctrl border border-line bg-surface-2 px-3 py-2.5 text-left transition",
          "hover:border-line-strong active:scale-[0.99]",
          "disabled:pointer-events-none disabled:opacity-40",
        )}
      >
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-surface text-[#4c86d9]">
          <Droplet className="h-4 w-4" />
        </span>
        <span className="min-w-0">
          <span className="block text-xs font-semibold text-ink">Distilled Water</span>
          <span className="block text-[11px] text-ink-3">
            Solvent · dissolve solids &amp; throw metals in
          </span>
        </span>
      </button>

      <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
        {GROUPS.map((group) => (
          <div key={group.label}>
            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-3">
              {group.label}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {group.items.map((reagent) => (
                <button
                  key={reagent.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => add(reagent.id)}
                  title={reagent.hazard ? `${reagent.name} · ${reagent.hazard}` : reagent.name}
                  className={cn(
                    "flex items-center gap-2.5 rounded-ctrl border border-line bg-surface px-3 py-2 text-left transition",
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
        ))}
      </div>

      {/* Elements — reactive metals down the reactivity series */}
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
          Ordered most → least reactive. K, Na, Li &amp; Ca react with water;
          those above H (down to Pb) react with acid; Cu with neither. A more
          reactive metal displaces a less reactive one from its salt.
        </p>
        <div className="grid grid-cols-3 gap-2">
          {METALS.map((metal) => (
            <button
              key={metal.id}
              type="button"
              disabled={disabled}
              onClick={() => add(metal.id)}
              title={metal.hazard ? `${metal.name} · ${metal.hazard}` : metal.name}
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
