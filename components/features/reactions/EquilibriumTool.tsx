"use client";

import { useState, type ReactNode } from "react";
import {
  leChatelier,
  molarSolubility,
  type Shift,
  type Stress,
} from "@/lib/chemistry/equilibrium";
import { Field } from "@/components/ui/Field";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
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

function ResultCard({ children }: { children: ReactNode }) {
  return <div className="rounded-ctrl bg-surface-2 p-4">{children}</div>;
}
function Stat({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div>
      <div className="text-xs text-ink-3">{label}</div>
      <div className="text-lg font-semibold tabular-nums text-ink">
        {value}
        {unit && <span className="ml-1 text-xs font-normal text-ink-2">{unit}</span>}
      </div>
    </div>
  );
}

// ── Solubility (Ksp) ──────────────────────────────────────────
const SALTS = [
  { id: "AgCl", label: "AgCl", ksp: "1.8e-10", x: 1, y: 1 },
  { id: "BaSO4", label: "BaSO₄", ksp: "1.1e-10", x: 1, y: 1 },
  { id: "CaF2", label: "CaF₂", ksp: "3.9e-11", x: 1, y: 2 },
  { id: "PbI2", label: "PbI₂", ksp: "7.1e-9", x: 1, y: 2 },
  { id: "Ag2CrO4", label: "Ag₂CrO₄", ksp: "1.1e-12", x: 2, y: 1 },
];

function SolubilityPanel() {
  const [ksp, setKsp] = useState("1.8e-10");
  const [x, setX] = useState("1");
  const [y, setY] = useState("1");

  const kv = num(ksp);
  const xv = num(x);
  const yv = num(y);
  const s = kv != null && xv != null && yv != null ? molarSolubility(kv, xv, yv) : NaN;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {SALTS.map((salt) => (
          <button
            key={salt.id}
            type="button"
            onClick={() => {
              setKsp(salt.ksp);
              setX(String(salt.x));
              setY(String(salt.y));
            }}
            className="rounded-pill border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink-2 transition hover:border-line-strong hover:text-ink"
          >
            {salt.label}
          </button>
        ))}
      </div>
      <p className="text-xs text-ink-2">
        For AₓBᵧ ⇌ x·Aⁿ⁺ + y·Bᵐ⁻, Ksp = (x·s)ˣ(y·s)ʸ. Enter Ksp and the ion counts.
      </p>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Ksp" value={ksp} onChange={setKsp} inputMode="decimal" />
        <Field label="x (cation)" value={x} onChange={setX} inputMode="decimal" />
        <Field label="y (anion)" value={y} onChange={setY} inputMode="decimal" />
      </div>
      {Number.isFinite(s) ? (
        <ResultCard>
          <Stat label="Molar solubility s" value={fmt(s)} unit="mol/L" />
        </ResultCard>
      ) : (
        <p className="text-xs text-ink-3">
          Enter a positive Ksp and integer stoichiometry (x, y ≥ 1).
        </p>
      )}
    </div>
  );
}

// ── Le Chatelier ──────────────────────────────────────────────
const EQUILIBRIA = [
  { id: "haber", label: "N₂ + 3H₂ ⇌ 2NH₃", deltaNgas: -2, exothermic: true },
  { id: "contact", label: "2SO₂ + O₂ ⇌ 2SO₃", deltaNgas: -1, exothermic: true },
  { id: "n2o4", label: "N₂O₄ ⇌ 2NO₂", deltaNgas: 1, exothermic: false },
  { id: "hi", label: "H₂ + I₂ ⇌ 2HI", deltaNgas: 0, exothermic: true },
];

const STRESSES: { key: Stress; label: string }[] = [
  { key: "addReactant", label: "Add reactant" },
  { key: "removeProduct", label: "Remove product" },
  { key: "addProduct", label: "Add product" },
  { key: "increasePressure", label: "Increase pressure" },
  { key: "decreasePressure", label: "Decrease pressure" },
  { key: "increaseTemp", label: "Increase temperature" },
  { key: "decreaseTemp", label: "Decrease temperature" },
  { key: "catalyst", label: "Add catalyst" },
];

function ShiftCell({ shift }: { shift: Shift }) {
  if (shift === "none") return <span className="text-ink-3">no shift</span>;
  return (
    <span className="font-semibold text-ink">
      {shift === "right" ? "→ products" : "← reactants"}
    </span>
  );
}

function LeChatelierPanel() {
  const [eqId, setEqId] = useState("haber");
  const eq = EQUILIBRIA.find((e) => e.id === eqId) ?? EQUILIBRIA[0];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {EQUILIBRIA.map((e) => (
          <button
            key={e.id}
            type="button"
            onClick={() => setEqId(e.id)}
            aria-pressed={e.id === eqId}
            className={cn(
              "rounded-pill px-3 py-1.5 text-xs font-medium transition",
              e.id === eqId
                ? "bg-ink text-on-dark"
                : "border border-line bg-surface text-ink-2 hover:text-ink",
            )}
          >
            {e.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-ink-2">
        <span>
          Δn(gas) ={" "}
          <span className="font-semibold tabular-nums text-ink">
            {eq.deltaNgas > 0 ? "+" : ""}
            {eq.deltaNgas}
          </span>
        </span>
        <span>
          Forward reaction:{" "}
          <span className="font-semibold text-ink">
            {eq.exothermic ? "exothermic" : "endothermic"}
          </span>
        </span>
      </div>
      <div className="overflow-hidden rounded-ctrl border border-line">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface-2 text-left text-xs text-ink-3">
              <th className="px-3 py-2 font-medium">Stress</th>
              <th className="px-3 py-2 font-medium">Shift</th>
              <th className="hidden px-3 py-2 font-medium sm:table-cell">Why</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {STRESSES.map((st) => {
              const { shift, reason } = leChatelier(eq, st.key);
              return (
                <tr key={st.key}>
                  <td className="px-3 py-2 text-ink">{st.label}</td>
                  <td className="px-3 py-2">
                    <ShiftCell shift={shift} />
                  </td>
                  <td className="hidden px-3 py-2 text-xs text-ink-2 sm:table-cell">
                    {reason}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function EquilibriumTool() {
  const [mode, setMode] = useState<"solubility" | "lechatelier">("solubility");
  return (
    <div className="space-y-5">
      <SegmentedControl
        layoutId="equil-mode"
        aria-label="Equilibrium mode"
        options={[
          { value: "solubility" as const, label: "Solubility (Ksp)" },
          { value: "lechatelier" as const, label: "Le Chatelier" },
        ]}
        value={mode}
        onChange={setMode}
      />
      {mode === "solubility" ? <SolubilityPanel /> : <LeChatelierPanel />}
    </div>
  );
}
