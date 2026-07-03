"use client";

import { useState } from "react";
import {
  REDOX_TITRATIONS,
  redoxTitrationConcentration,
} from "@/lib/chemistry/redoxTitration";
import { Field } from "@/components/ui/Field";
import { cn } from "@/lib/utils";

const num = (s: string): number | null => {
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : null;
};
const fmt = (n: number): string => {
  if (!Number.isFinite(n)) return "—";
  const a = Math.abs(n);
  if (a !== 0 && (a >= 1e4 || a < 1e-3)) return n.toExponential(2);
  return Number(n.toPrecision(4)).toString();
};

export function RedoxTitrationTool() {
  const [presetId, setPresetId] = useState(REDOX_TITRATIONS[0].id);
  const preset = REDOX_TITRATIONS.find((p) => p.id === presetId) ?? REDOX_TITRATIONS[0];
  const [cTit, setCTit] = useState("0.0200");
  const [vTit, setVTit] = useState("20.00");
  const [vAn, setVAn] = useState("25.00");

  const c = num(cTit);
  const vt = num(vTit);
  const va = num(vAn);
  const valid = c != null && c > 0 && vt != null && vt > 0 && va != null && va > 0;
  const result = valid
    ? redoxTitrationConcentration({
        cTitrant: c,
        vTitrant: vt,
        nTitrant: preset.nTitrant,
        vAnalyte: va,
        nAnalyte: preset.nAnalyte,
      })
    : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {REDOX_TITRATIONS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPresetId(p.id)}
            aria-pressed={p.id === presetId}
            className={cn(
              "rounded-pill px-3 py-1.5 text-xs font-medium transition",
              p.id === presetId
                ? "bg-ink text-on-dark"
                : "border border-line bg-surface text-ink-2 hover:text-ink",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="rounded-ctrl bg-surface-2 px-3 py-2.5 text-sm tabular-nums text-ink">
        {preset.equation}
      </div>

      <p className="text-xs text-ink-2">
        At equivalence the electrons balance: n·c·V (titrant) = n·c·V (analyte).
        Enter the titration data to find [{preset.analyte}].
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Field label={`[${preset.titrant}]`} value={cTit} onChange={setCTit} unit="mol/L" inputMode="decimal" />
        <Field label={`${preset.titrant} volume`} value={vTit} onChange={setVTit} unit="mL" inputMode="decimal" />
        <Field label={`${preset.analyte} volume`} value={vAn} onChange={setVAn} unit="mL" inputMode="decimal" />
      </div>

      {result != null ? (
        <div className="rounded-ctrl bg-surface-2 p-4">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-sm text-ink-2">
              [{preset.analyte}] at equivalence
            </span>
            <span className="text-2xl font-semibold tabular-nums text-ink">
              {fmt(result)}
              <span className="ml-1 text-sm font-normal text-ink-2">mol/L</span>
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-x-6 text-xs text-ink-3">
            <span>
              e⁻ per {preset.titrant}:{" "}
              <span className="font-semibold text-ink">{preset.nTitrant}</span>
            </span>
            <span>
              e⁻ per {preset.analyte}:{" "}
              <span className="font-semibold text-ink">{preset.nAnalyte}</span>
            </span>
          </div>
        </div>
      ) : (
        <p className="text-xs text-ink-3">Enter positive concentration and volumes.</p>
      )}
    </div>
  );
}
