"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, FlaskConical, Plus, RotateCcw, X } from "lucide-react";
import { useSandbox } from "@/lib/stores/sandboxStore";
import { VesselCard } from "./VesselCard";
import { ReagentShelf } from "./ReagentShelf";
import { ObservationLog } from "./ObservationLog";
import { SandboxAi } from "./SandboxAi";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { BenchIO } from "./BenchIO";

const VESSEL_OPTIONS = [
  { apparatusId: "beaker-250", label: "Beaker" },
  { apparatusId: "erlenmeyer-250", label: "Flask" },
  { apparatusId: "test-tube-20", label: "Test tube" },
  { apparatusId: "graduated-cylinder-100", label: "Cylinder" },
];

const MAX_VESSELS = 6;

export function SandboxView() {
  const vessels = useSandbox((s) => s.vessels);
  const pourSourceId = useSandbox((s) => s.pourSourceId);
  const addVessel = useSandbox((s) => s.addVessel);
  const cancelPour = useSandbox((s) => s.cancelPour);
  const resetAll = useSandbox((s) => s.resetAll);

  // Hydrate the bench from staged apparatus and run the fixed-step tick loop.
  useEffect(() => {
    useSandbox.getState().hydrateFromBench();
    const id = setInterval(() => useSandbox.getState().tick(0.2), 200);
    return () => clearInterval(id);
  }, []);

  const full = vessels.length >= MAX_VESSELS;

  return (
    <div className="mt-8">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link
            href="/"
            className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-ink-2 transition hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Inventory
          </Link>
          <p className="mb-1 text-sm font-medium text-ink-2">Module 1 · §1.2</p>
          <h1 className="text-4xl font-semibold tracking-tight text-ink">
            Interactive Sandbox
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-2">
            Select a vessel, add reagents from the shelf, then heat or pour
            between vessels. Colour shifts, precipitates, gas, and boiling are
            computed from the mixture — watch the Observations panel.
          </p>
        </div>
        <div data-tour="sandbox-actions" className="flex items-center gap-2">
          <BenchIO />
          <Button variant="soft" size="sm" onClick={resetAll}>
            <RotateCcw className="h-4 w-4" />
            Reset experiment
          </Button>
        </div>
      </div>

      {/* Pour banner */}
      {pourSourceId && (
        <div className="mt-5 flex items-center justify-between gap-3 rounded-card border border-accent-strong bg-accent-soft px-4 py-3">
          <span className="text-sm font-medium text-ink">
            Pour mode — click the vessel you want to pour into.
          </span>
          <button
            type="button"
            onClick={cancelPour}
            className="inline-flex items-center gap-1 rounded-pill bg-ink px-3 py-1.5 text-xs font-medium text-on-dark"
          >
            <X className="h-3.5 w-3.5" />
            Cancel
          </button>
        </div>
      )}

      {/* Main layout */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
        {/* Bench */}
        <div data-tour="sandbox-bench">
        <Card tone="cream" className="p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-ink">The Bench</h2>
            <div data-tour="sandbox-vessels" className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 text-xs text-ink-3">Add vessel:</span>
              {VESSEL_OPTIONS.map((option) => (
                <Button
                  key={option.apparatusId}
                  variant="soft"
                  size="sm"
                  disabled={full}
                  onClick={() => addVessel(option.apparatusId)}
                >
                  <Plus className="h-3.5 w-3.5" />
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {vessels.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-line-strong py-16 text-center">
              <FlaskConical className="mb-3 h-8 w-8 text-ink-3" />
              <p className="text-sm font-medium text-ink">The bench is empty</p>
              <p className="mt-1 text-xs text-ink-2">
                Add a vessel above to get started.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {vessels.map((vessel) => (
                <VesselCard key={vessel.id} vessel={vessel} />
              ))}
            </div>
          )}
          <div className="mt-3">
            <SandboxAi />
          </div>
        </Card>
        </div>

        {/* Right rail */}
        <div className="flex flex-col gap-6">
          <div data-tour="sandbox-shelf">
            <ReagentShelf />
          </div>
          <div data-tour="sandbox-log">
            <ObservationLog />
          </div>
        </div>
      </div>
    </div>
  );
}
