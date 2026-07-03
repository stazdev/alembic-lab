"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";
import { Plus, X } from "lucide-react";
import {
  molarMass,
  solveDilution,
  solveLimiting,
  type DilutionKey,
} from "@/lib/chemistry/stoichiometry";
import { FormulaText } from "@/components/chem/FormulaText";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { cn } from "@/lib/utils";

const ERR = "#c0492e";
const num = (s: string): number | null => {
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : null;
};
const fmt = (n: number): string => Number(n.toPrecision(4)).toString();

type Mode = "molarMass" | "solution" | "dilution" | "limiting";

const MODES = [
  { value: "molarMass" as const, label: "Molar mass" },
  { value: "solution" as const, label: "Solution" },
  { value: "dilution" as const, label: "Dilution" },
  { value: "limiting" as const, label: "Limiting reagent" },
];

function ResultCard({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-ctrl bg-surface-2 p-4">{children}</div>
  );
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

// ── Molar mass ────────────────────────────────────────────────
function MolarMassPanel() {
  const [formula, setFormula] = useState("C6H12O6");
  const trimmed = formula.trim();
  const res = molarMass(trimmed);

  return (
    <div className="space-y-4">
      <Field
        label="Formula"
        value={formula}
        onChange={setFormula}
        placeholder="e.g. C6H12O6"
        className="max-w-xs"
      />
      {res.ok ? (
        <ResultCard>
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <span className="text-lg text-ink">
              <FormulaText formula={res.value.formula} />
            </span>
            <span className="text-2xl font-semibold tabular-nums text-ink">
              {res.value.molarMass.toFixed(3)}
              <span className="ml-1 text-sm font-normal text-ink-2">g/mol</span>
            </span>
          </div>
          <div className="divide-y divide-line">
            {res.value.parts.map((p) => (
              <div
                key={p.element}
                className="flex items-center justify-between py-1.5 text-sm"
              >
                <span className="text-ink-2">
                  {p.count} × {p.element}{" "}
                  <span className="text-ink-3">({p.atomicMass})</span>
                </span>
                <span className="tabular-nums text-ink">
                  {p.subtotal.toFixed(3)}
                </span>
              </div>
            ))}
          </div>
        </ResultCard>
      ) : (
        trimmed && (
          <p className="text-sm" style={{ color: ERR }}>
            {res.error}
          </p>
        )
      )}
    </div>
  );
}

// ── Solution (molarity / mass) ────────────────────────────────
function SolutionPanel() {
  const [mode, setMode] = useState<"molarity" | "mass">("molarity");
  const [formula, setFormula] = useState("NaCl");
  const [mass, setMass] = useState("5.844");
  const [volume, setVolume] = useState("1");
  const [conc, setConc] = useState("0.5");

  const mm = molarMass(formula.trim());
  const v = num(volume);

  let moles: number | null = null;
  let outMass: number | null = null;
  let outMolarity: number | null = null;

  if (mm.ok && v != null && v > 0) {
    if (mode === "molarity") {
      const m = num(mass);
      if (m != null) {
        moles = m / mm.value.molarMass;
        outMolarity = moles / v;
      }
    } else {
      const c = num(conc);
      if (c != null) {
        moles = c * v;
        outMass = moles * mm.value.molarMass;
      }
    }
  }

  return (
    <div className="space-y-4">
      <SegmentedControl
        layoutId="solution-mode"
        aria-label="Solution mode"
        options={[
          { value: "molarity" as const, label: "Find molarity" },
          { value: "mass" as const, label: "Find mass needed" },
        ]}
        value={mode}
        onChange={setMode}
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Field label="Formula" value={formula} onChange={setFormula} placeholder="NaCl" />
        {mode === "molarity" ? (
          <Field label="Mass" value={mass} onChange={setMass} unit="g" inputMode="decimal" />
        ) : (
          <Field label="Concentration" value={conc} onChange={setConc} unit="mol/L" inputMode="decimal" />
        )}
        <Field label="Volume" value={volume} onChange={setVolume} unit="L" inputMode="decimal" />
      </div>

      {mm.ok && moles != null ? (
        <ResultCard>
          <div className="flex flex-wrap gap-x-10 gap-y-3">
            <Stat label="Molar mass" value={mm.value.molarMass.toFixed(2)} unit="g/mol" />
            <Stat label="Amount" value={fmt(moles)} unit="mol" />
            {mode === "molarity" && outMolarity != null && (
              <Stat label="Molarity" value={fmt(outMolarity)} unit="mol/L" />
            )}
            {mode === "mass" && outMass != null && (
              <Stat label="Mass needed" value={fmt(outMass)} unit="g" />
            )}
          </div>
        </ResultCard>
      ) : (
        <p className="text-xs text-ink-3">
          {mm.ok
            ? "Enter the remaining values to see the result."
            : formula.trim() && (
                <span style={{ color: ERR }}>{mm.error}</span>
              )}
        </p>
      )}
    </div>
  );
}

// ── Dilution ──────────────────────────────────────────────────
function DilutionPanel() {
  const [c1, setC1] = useState("2");
  const [v1, setV1] = useState("");
  const [c2, setC2] = useState("0.5");
  const [v2, setV2] = useState("1");

  const res = solveDilution(num(c1), num(v1), num(c2), num(v2));
  const labels: Record<DilutionKey, string> = {
    c1: "C₁",
    v1: "V₁",
    c2: "C₂",
    v2: "V₂",
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-ink-2">
        C₁V₁ = C₂V₂ — fill three fields and leave the one you want to find blank.
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Field label="C₁ (stock)" value={c1} onChange={setC1} unit="mol/L" inputMode="decimal" />
        <Field label="V₁ (stock)" value={v1} onChange={setV1} unit="L" inputMode="decimal" />
        <Field label="C₂ (final)" value={c2} onChange={setC2} unit="mol/L" inputMode="decimal" />
        <Field label="V₂ (final)" value={v2} onChange={setV2} unit="L" inputMode="decimal" />
      </div>
      {res.ok ? (
        <ResultCard>
          <Stat
            label={`Solved for ${labels[res.value.solved]}`}
            value={fmt(res.value[res.value.solved])}
            unit={res.value.solved.startsWith("c") ? "mol/L" : "L"}
          />
        </ResultCard>
      ) : (
        <p className="text-xs text-ink-3">{res.error}</p>
      )}
    </div>
  );
}

// ── Limiting reagent & yield ──────────────────────────────────
interface RRow {
  id: number;
  coeff: string;
  formula: string;
  grams: string;
}
interface PRow {
  id: number;
  coeff: string;
  formula: string;
}

function LimitingPanel() {
  const idRef = useRef(10);
  const [reactants, setReactants] = useState<RRow[]>([
    { id: 1, coeff: "2", formula: "H2", grams: "4" },
    { id: 2, coeff: "1", formula: "O2", grams: "32" },
  ]);
  const [products, setProducts] = useState<PRow[]>([
    { id: 3, coeff: "2", formula: "H2O" },
  ]);

  const result = useMemo(() => {
    const rIn = reactants.map((r) => ({
      formula: r.formula.trim(),
      coeff: num(r.coeff) ?? 0,
      grams: num(r.grams) ?? 0,
    }));
    const pIn = products.map((p) => ({
      formula: p.formula.trim(),
      coeff: num(p.coeff) ?? 0,
    }));
    const ready =
      rIn.every((r) => r.formula && r.coeff >= 1 && r.grams >= 0) &&
      pIn.every((p) => p.formula && p.coeff >= 1);
    if (!ready) return null;
    return solveLimiting(rIn, pIn);
  }, [reactants, products]);

  const updateR = (id: number, patch: Partial<RRow>) =>
    setReactants((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const updateP = (id: number, patch: Partial<PRow>) =>
    setProducts((ps) => ps.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Reactants */}
        <div>
          <div className="mb-2 text-xs font-medium text-ink-2">Reactants</div>
          <div className="space-y-2">
            {reactants.map((r) => (
              <div key={r.id} className="flex items-center gap-2">
                <input
                  aria-label="coefficient"
                  inputMode="decimal"
                  value={r.coeff}
                  onChange={(e) => updateR(r.id, { coeff: e.target.value })}
                  className="h-10 w-12 rounded-ctrl border border-line bg-surface text-center text-sm text-ink focus:border-ink-2 focus:outline-none"
                />
                <input
                  aria-label="formula"
                  value={r.formula}
                  onChange={(e) => updateR(r.id, { formula: e.target.value })}
                  className="h-10 flex-1 rounded-ctrl border border-line bg-surface px-3 text-sm text-ink focus:border-ink-2 focus:outline-none"
                />
                <input
                  aria-label="grams"
                  inputMode="decimal"
                  value={r.grams}
                  onChange={(e) => updateR(r.id, { grams: e.target.value })}
                  className="h-10 w-16 rounded-ctrl border border-line bg-surface px-2 text-center text-sm text-ink focus:border-ink-2 focus:outline-none"
                />
                <span className="text-xs text-ink-3">g</span>
                {reactants.length > 1 && (
                  <button
                    type="button"
                    aria-label="Remove reactant"
                    onClick={() => setReactants((rs) => rs.filter((x) => x.id !== r.id))}
                    className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-ink-3 hover:bg-line hover:text-ink"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() =>
              setReactants((rs) => [
                ...rs,
                { id: idRef.current++, coeff: "1", formula: "", grams: "0" },
              ])
            }
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-ink-2 hover:text-ink"
          >
            <Plus className="h-3.5 w-3.5" /> Add reactant
          </button>
        </div>

        {/* Products */}
        <div>
          <div className="mb-2 text-xs font-medium text-ink-2">Products</div>
          <div className="space-y-2">
            {products.map((p) => (
              <div key={p.id} className="flex items-center gap-2">
                <input
                  aria-label="coefficient"
                  inputMode="decimal"
                  value={p.coeff}
                  onChange={(e) => updateP(p.id, { coeff: e.target.value })}
                  className="h-10 w-12 rounded-ctrl border border-line bg-surface text-center text-sm text-ink focus:border-ink-2 focus:outline-none"
                />
                <input
                  aria-label="formula"
                  value={p.formula}
                  onChange={(e) => updateP(p.id, { formula: e.target.value })}
                  className="h-10 flex-1 rounded-ctrl border border-line bg-surface px-3 text-sm text-ink focus:border-ink-2 focus:outline-none"
                />
                {products.length > 1 && (
                  <button
                    type="button"
                    aria-label="Remove product"
                    onClick={() => setProducts((ps) => ps.filter((x) => x.id !== p.id))}
                    className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-ink-3 hover:bg-line hover:text-ink"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() =>
              setProducts((ps) => [
                ...ps,
                { id: idRef.current++, coeff: "1", formula: "" },
              ])
            }
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-ink-2 hover:text-ink"
          >
            <Plus className="h-3.5 w-3.5" /> Add product
          </button>
        </div>
      </div>

      {result == null ? (
        <p className="text-xs text-ink-3">
          Enter a coefficient, formula, and mass for each reactant (and formulas
          for the products) to compute the limiting reagent.
        </p>
      ) : result.ok ? (
        <ResultCard>
          <div className="mb-3 inline-flex items-center gap-2 rounded-pill bg-accent px-3 py-1 text-sm font-medium text-accent-ink">
            Limiting reagent: <FormulaText formula={result.value.limiting} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <div className="mb-1 text-xs text-ink-3">Theoretical yield</div>
              <div className="space-y-1">
                {result.value.products.map((p) => (
                  <div key={p.formula} className="flex justify-between text-sm">
                    <span className="text-ink">
                      <FormulaText formula={p.formula} />
                    </span>
                    <span className="tabular-nums text-ink-2">
                      {fmt(p.moles)} mol · {fmt(p.grams)} g
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-1 text-xs text-ink-3">Excess remaining</div>
              <div className="space-y-1">
                {result.value.reactants
                  .filter((r) => !r.limiting)
                  .map((r) => (
                    <div key={r.formula} className="flex justify-between text-sm">
                      <span className="text-ink">
                        <FormulaText formula={r.formula} />
                      </span>
                      <span className="tabular-nums text-ink-2">
                        {fmt(r.gramsRemaining)} g left
                      </span>
                    </div>
                  ))}
                {result.value.reactants.filter((r) => !r.limiting).length === 0 && (
                  <div className="text-sm text-ink-3">None — exact ratio</div>
                )}
              </div>
            </div>
          </div>
        </ResultCard>
      ) : (
        <p className="text-sm" style={{ color: ERR }}>
          {result.error}
        </p>
      )}
    </div>
  );
}

export function StoichiometryTool() {
  const [mode, setMode] = useState<Mode>("molarMass");

  return (
    <Card className="p-5 lg:p-6">
      <h2 className="text-base font-semibold text-ink">Stoichiometry &amp; Solutions</h2>
      <p className="mb-4 mt-1 text-xs text-ink-2">
        Molar mass, solution concentration, dilution, and limiting-reagent yields
        — all computed from the formula up.
      </p>

      <div className="mb-5 overflow-x-auto pb-1">
        <SegmentedControl
          layoutId="stoich-mode"
          aria-label="Calculator"
          options={MODES}
          value={mode}
          onChange={setMode}
        />
      </div>

      {mode === "molarMass" && <MolarMassPanel />}
      {mode === "solution" && <SolutionPanel />}
      {mode === "dilution" && <DilutionPanel />}
      {mode === "limiting" && <LimitingPanel />}
    </Card>
  );
}
