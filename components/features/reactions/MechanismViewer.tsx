"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MECHANISMS } from "@/data/mechanisms";
import { ChemEquation } from "@/components/chem/ChemEquation";
import { StructureDiagram } from "@/components/chem/StructureDiagram";
import { cn } from "@/lib/utils";

export function MechanismViewer() {
  const [mechId, setMechId] = useState(MECHANISMS[0].id);
  const [step, setStep] = useState(0);

  const mech = MECHANISMS.find((m) => m.id === mechId) ?? MECHANISMS[0];
  const current = mech.steps[step];
  const last = mech.steps.length - 1;

  function selectMech(id: string) {
    setMechId(id);
    setStep(0);
  }

  return (
    <div className="space-y-4">
      {/* Mechanism selector */}
      <div className="flex flex-wrap gap-2">
        {MECHANISMS.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => selectMech(m.id)}
            aria-pressed={m.id === mechId}
            className={cn(
              "rounded-pill px-3.5 py-1.5 text-sm font-medium transition",
              m.id === mechId
                ? "bg-ink text-on-dark"
                : "border border-line bg-surface text-ink-2 hover:text-ink",
            )}
          >
            {m.name}
          </button>
        ))}
      </div>

      {/* Overall reaction */}
      <div className="rounded-ctrl bg-surface-2 p-4">
        <div className="text-[11px] font-medium uppercase tracking-wide text-ink-3">
          {mech.type}
        </div>
        <div className="mt-2 text-base text-ink">
          <ChemEquation
            reactants={mech.overallReactants}
            products={mech.overallProducts}
          />
        </div>
        <p className="mt-2 text-xs leading-relaxed text-ink-2">{mech.summary}</p>
      </div>

      {/* Step viewer */}
      <div className="rounded-card border border-line p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-ink-3">
            Step {step + 1} of {mech.steps.length}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              aria-label="Previous step"
              className="grid h-8 w-8 place-items-center rounded-pill border border-line bg-surface text-ink transition hover:bg-surface-2 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setStep((s) => Math.min(last, s + 1))}
              disabled={step === last}
              aria-label="Next step"
              className="grid h-8 w-8 place-items-center rounded-pill border border-line bg-surface text-ink transition hover:bg-surface-2 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <h3 className="mt-2 text-base font-semibold text-ink">{current.title}</h3>

        <div className="mt-3 grid gap-4 md:grid-cols-[1fr_1.15fr] md:items-center">
          {current.smiles ? (
            <div className="relative h-52 overflow-hidden rounded-ctrl border border-line bg-surface">
              <StructureDiagram smiles={current.smiles} />
              {current.label && (
                <div className="pointer-events-none absolute inset-x-0 bottom-1.5 text-center text-[11px] text-ink-3">
                  {current.label}
                </div>
              )}
            </div>
          ) : (
            <div className="grid h-52 place-items-center rounded-ctrl border border-dashed border-line-strong px-4 text-center text-xs text-ink-3">
              Transition state — follow the description
            </div>
          )}
          <p className="text-sm leading-relaxed text-ink-2">
            {current.description}
          </p>
        </div>

        {/* Step dots */}
        <div className="mt-4 flex justify-center gap-1.5">
          {mech.steps.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setStep(i)}
              aria-label={`Go to step ${i + 1}`}
              aria-current={i === step}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === step ? "w-5 bg-ink" : "w-1.5 bg-line-strong hover:bg-ink-3",
              )}
            />
          ))}
        </div>
      </div>

      <p className="text-xs text-ink-3">
        Each step narrates the curved-arrow electron movement; structures are
        rendered live from SMILES.
      </p>
    </div>
  );
}
