"use client";

import { useState } from "react";
import { MOLECULE_LIBRARY } from "@/data/moleculeLibrary";
import { FormulaText } from "@/components/chem/FormulaText";
import { SearchField } from "@/components/ui/SearchField";
import { cn } from "@/lib/utils";
import { MoleculeViewer } from "./MoleculeViewer";

interface Active {
  moleculeKey?: string;
  name?: string;
  cid?: number;
  label: string;
  formula?: string;
}

export function MoleculesExplorer() {
  const [active, setActive] = useState<Active>({
    moleculeKey: "water",
    label: "Water",
    formula: "H2O",
  });
  const [query, setQuery] = useState("");

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr]">
      {/* Library + search */}
      <div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const q = query.trim();
            if (q) setActive({ name: q, label: q });
          }}
          className="mb-4"
        >
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder="Search any compound (e.g. toluene)…"
          />
        </form>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {MOLECULE_LIBRARY.map((m) => {
            const isActive = active.moleculeKey === m.key;
            return (
              <button
                key={m.key}
                type="button"
                onClick={() =>
                  setActive({
                    moleculeKey: m.key,
                    label: m.name,
                    formula: m.formula,
                  })
                }
                aria-pressed={isActive}
                className={cn(
                  "rounded-card border p-3 text-left transition",
                  isActive
                    ? "border-ink-2 bg-surface shadow-soft"
                    : "border-line bg-surface hover:border-line-strong",
                )}
              >
                <div className="text-sm font-semibold text-ink">{m.name}</div>
                <div className="mt-0.5 text-xs text-ink-2">
                  <FormulaText formula={m.formula} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Viewer */}
      <div>
        <div className="mb-3">
          <div className="text-lg font-semibold text-ink">{active.label}</div>
          {active.formula && (
            <div className="text-sm text-ink-2">
              <FormulaText formula={active.formula} />
            </div>
          )}
        </div>
        <MoleculeViewer
          key={active.moleculeKey ?? active.name}
          moleculeKey={active.moleculeKey}
          name={active.name}
          cid={active.cid}
        />
      </div>
    </div>
  );
}
