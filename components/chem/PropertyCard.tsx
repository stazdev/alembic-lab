"use client";

/**
 * Estimated molecular properties for a SMILES, computed on-device by
 * OpenChemLib. Everything shown is an ESTIMATE and labelled as such; it is
 * pedagogical, not lab-grade. Reference data always wins where the app has it.
 */
import { useEffect, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import {
  predictProperties,
  type PredictedProperties,
} from "@/lib/chem/openchemlib";
import { Pill } from "@/components/ui/Pill";
import { Tooltip } from "@/components/ui/Tooltip";

type State =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; data: PredictedProperties };

/** Qualitative solubility band from log₁₀(S) in mol/L. */
function solubilityWord(logS: number): string {
  if (logS >= 0) return "very soluble";
  if (logS >= -2) return "soluble";
  if (logS >= -4) return "slightly soluble";
  return "poorly soluble";
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <Tooltip content={hint}>
      <div className="rounded-ctrl bg-surface-2 px-3 py-2.5 text-left">
        <div className="text-base font-semibold tabular-nums text-ink">
          {value}
        </div>
        <div className="mt-0.5 text-[11px] leading-tight text-ink-2">
          {label}
        </div>
      </div>
    </Tooltip>
  );
}

export function PropertyCard({ smiles }: { smiles?: string }) {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    if (!smiles) return;
    let cancelled = false;
    setState({ status: "loading" });
    predictProperties(smiles)
      .then((data) => {
        if (cancelled) return;
        setState(data ? { status: "ready", data } : { status: "error" });
      })
      .catch(() => !cancelled && setState({ status: "error" }));
    return () => {
      cancelled = true;
    };
  }, [smiles]);

  if (!smiles) return null;

  return (
    <div className="rounded-card border border-line bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-ink">Estimated properties</h3>
        <Tooltip content="Computed on-device from the structure by OpenChemLib. Estimates for learning — not lab-grade values.">
          <span>
            <Pill tone="soft">
              <Sparkles className="h-3 w-3" />
              estimated
            </Pill>
          </span>
        </Tooltip>
      </div>

      {state.status === "loading" && (
        <div className="flex items-center gap-2 py-6 text-xs text-ink-3">
          <Loader2 className="h-4 w-4 animate-spin" />
          Estimating…
        </div>
      )}

      {state.status === "error" && (
        <p className="py-6 text-xs text-ink-2">
          Couldn&rsquo;t estimate properties for this structure.
        </p>
      )}

      {state.status === "ready" && (
        <>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <Stat
              label="Molar mass (g/mol)"
              value={state.data.molWeight.toFixed(1)}
              hint="Molecular weight from the structural formula."
            />
            <Stat
              label="logP"
              value={state.data.logP.toFixed(2)}
              hint="Octanol–water partition coefficient — higher means more lipophilic (fat-loving)."
            />
            <Stat
              label="Solubility (log S)"
              value={state.data.logS.toFixed(2)}
              hint={`Estimated aqueous solubility, log₁₀(mol/L) — ${solubilityWord(
                state.data.logS,
              )}.`}
            />
            <Stat
              label="Polar surface (Å²)"
              value={state.data.tpsa.toFixed(0)}
              hint="Topological polar surface area — relates to permeability and absorption."
            />
            <Stat
              label="H-bond donors"
              value={String(state.data.hbd)}
              hint="Number of hydrogen-bond donor atoms (N–H, O–H)."
            />
            <Stat
              label="H-bond acceptors"
              value={String(state.data.hba)}
              hint="Number of hydrogen-bond acceptor atoms (N, O)."
            />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3">
            <span className="text-xs text-ink-2">Rotatable bonds</span>
            <span className="text-xs font-semibold tabular-nums text-ink">
              {state.data.rotatableBonds}
            </span>
            <span className="mx-1 h-3 w-px bg-line" />
            <Tooltip
              content={
                state.data.lipinski.violations.length
                  ? `Violations: ${state.data.lipinski.violations.join(", ")}`
                  : "Meets all four Lipinski criteria (MW ≤ 500, logP ≤ 5, donors ≤ 5, acceptors ≤ 10)."
              }
            >
              <span>
                <Pill tone={state.data.lipinski.passes ? "soft" : "outline"}>
                  Lipinski Ro5:{" "}
                  {state.data.lipinski.passes ? "pass" : "fail"}
                </Pill>
              </span>
            </Tooltip>
          </div>
        </>
      )}
    </div>
  );
}
