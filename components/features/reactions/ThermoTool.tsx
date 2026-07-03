"use client";

import { useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import {
  gibbs,
  kFromDG,
  heat,
  reactionThermo,
  type ThermoTerm,
} from "@/lib/chemistry/thermo";
import { THERMO_BY_ID, THERMO_SPECIES, type ThermoSpecies } from "@/data/thermoData";
import { FormulaText } from "@/components/chem/FormulaText";
import { ChemEquation, type ChemTerm } from "@/components/chem/ChemEquation";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { NumberStepper } from "@/components/ui/NumberStepper";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Popover, PopoverTrigger, PopoverContent, PopoverClose } from "@/components/ui/Popover";

const num = (s: string): number | null => {
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : null;
};
const f1 = (n: number) => n.toFixed(1);
const fmtK = (K: number): string => {
  if (!Number.isFinite(K)) return "∞";
  if (K === 0) return "0";
  if (K >= 1e4 || K < 1e-3) return K.toExponential(2);
  return Number(K.toPrecision(3)).toString();
};

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

function SpeciesLabel({ species }: { species: ThermoSpecies }) {
  return (
    <span>
      <FormulaText formula={species.formula} />
      <span className="text-ink-3"> ({species.state})</span>
    </span>
  );
}

function SpeciesPicker({ label, onSelect }: { label: string; onSelect: (s: ThermoSpecies) => void }) {
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();
  const filtered = THERMO_SPECIES.filter(
    (s) => s.id.toLowerCase().includes(query) || s.formula.toLowerCase().includes(query),
  );
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex h-9 items-center gap-1 rounded-ctrl border border-dashed border-line-strong px-3 text-xs font-medium text-ink-2 transition hover:border-ink-2 hover:text-ink"
        >
          <Plus className="h-3.5 w-3.5" /> {label}
        </button>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="start" className="w-64 p-2">
        <Field value={q} onChange={setQ} placeholder="Search species…" aria-label="Search species" className="mb-2" />
        <div className="max-h-56 space-y-0.5 overflow-y-auto">
          {filtered.map((s) => (
            <PopoverClose asChild key={s.id}>
              <button
                type="button"
                onClick={() => onSelect(s)}
                className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm text-ink transition hover:bg-surface-2"
              >
                <SpeciesLabel species={s} />
                <span className="shrink-0 text-[11px] tabular-nums text-ink-3">{s.dHf} kJ/mol</span>
              </button>
            </PopoverClose>
          ))}
          {filtered.length === 0 && <p className="px-2 py-2 text-xs text-ink-3">No match</p>}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function SpontaneityBadge({ spontaneous }: { spontaneous: boolean }) {
  return spontaneous ? (
    <span className="rounded-pill bg-accent px-3 py-1 text-xs font-medium text-accent-ink">
      Spontaneous (ΔG &lt; 0)
    </span>
  ) : (
    <span className="rounded-pill bg-dark px-3 py-1 text-xs font-medium text-on-dark">
      Non-spontaneous (ΔG &gt; 0)
    </span>
  );
}

// ── Reaction (Hess's law) ─────────────────────────────────────
interface Row {
  id: number;
  speciesId: string;
  coeff: number;
}

const rowToTerm = (r: Row): ChemTerm => {
  const s = THERMO_BY_ID[r.speciesId];
  return { coeff: r.coeff, formula: s.formula, state: s.state };
};

interface Preset {
  name: string;
  reactants: [string, number][];
  products: [string, number][];
}

const PRESETS: Preset[] = [
  {
    name: "Methane combustion",
    reactants: [["CH4(g)", 1], ["O2(g)", 2]],
    products: [["CO2(g)", 1], ["H2O(l)", 2]],
  },
  {
    name: "Haber process",
    reactants: [["N2(g)", 1], ["H2(g)", 3]],
    products: [["NH3(g)", 2]],
  },
  {
    name: "Limestone → lime",
    reactants: [["CaCO3(s)", 1]],
    products: [["CaO(s)", 1], ["CO2(g)", 1]],
  },
  {
    name: "Thermite",
    reactants: [["Al(s)", 2], ["Fe2O3(s)", 1]],
    products: [["Al2O3(s)", 1], ["Fe(s)", 2]],
  },
];

function ReactionPanel() {
  const idRef = useRef(100);
  const build = (list: [string, number][]): Row[] =>
    list.map(([speciesId, coeff]) => ({ id: idRef.current++, speciesId, coeff }));

  const [reactants, setReactants] = useState<Row[]>(() => build(PRESETS[0].reactants));
  const [products, setProducts] = useState<Row[]>(() => build(PRESETS[0].products));
  const [tempC, setTempC] = useState("25");

  const T = (num(tempC) ?? 25) + 273.15;
  const toTerms = (rows: Row[]): ThermoTerm[] =>
    rows.map((r) => {
      const sp = THERMO_BY_ID[r.speciesId];
      return { dHf: sp.dHf, s: sp.s, coeff: r.coeff };
    });
  const result =
    reactants.length > 0 && products.length > 0
      ? reactionThermo(toTerms(reactants), toTerms(products), T)
      : null;

  const setCoeff = (side: "r" | "p", id: number, coeff: number) => {
    const update = (rows: Row[]) => rows.map((r) => (r.id === id ? { ...r, coeff } : r));
    if (side === "r") setReactants(update);
    else setProducts(update);
  };
  const remove = (side: "r" | "p", id: number) => {
    if (side === "r") setReactants((rows) => rows.filter((r) => r.id !== id));
    else setProducts((rows) => rows.filter((r) => r.id !== id));
  };
  const add = (side: "r" | "p", sp: ThermoSpecies) => {
    const row: Row = { id: idRef.current++, speciesId: sp.id, coeff: 1 };
    if (side === "r") setReactants((rows) => [...rows, row]);
    else setProducts((rows) => [...rows, row]);
  };

  const column = (side: "r" | "p", rows: Row[], title: string) => (
    <div>
      <div className="mb-2 text-xs font-medium text-ink-2">{title}</div>
      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.id} className="flex items-center gap-2">
            <NumberStepper
              value={r.coeff}
              min={1}
              max={30}
              onChange={(c) => setCoeff(side, r.id, c)}
              aria-label={`Coefficient for ${r.speciesId}`}
            />
            <span className="flex-1 text-sm">
              <SpeciesLabel species={THERMO_BY_ID[r.speciesId]} />
            </span>
            <button
              type="button"
              aria-label={`Remove ${r.speciesId}`}
              onClick={() => remove(side, r.id)}
              className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-ink-3 hover:bg-line hover:text-ink"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
      <div className="mt-2">
        <SpeciesPicker label={side === "r" ? "reactant" : "product"} onSelect={(s) => add(side, s)} />
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="shrink-0 text-xs text-ink-3">Examples:</span>
        {PRESETS.map((p) => (
          <button
            key={p.name}
            type="button"
            onClick={() => {
              setReactants(build(p.reactants));
              setProducts(build(p.products));
            }}
            className="shrink-0 rounded-pill border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink-2 transition hover:border-line-strong hover:text-ink"
          >
            {p.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto_1fr] md:items-start">
        {column("r", reactants, "Reactants")}
        <div className="hidden pt-8 text-xl text-ink-3 md:block">→</div>
        {column("p", products, "Products")}
      </div>

      <div className="max-w-40">
        <Field label="Temperature" value={tempC} onChange={setTempC} unit="°C" inputMode="decimal" />
      </div>

      {result && (
        <div className="rounded-ctrl bg-surface-2 p-4">
          <div className="mb-3">
            <SpontaneityBadge spontaneous={result.spontaneous} />
          </div>
          {reactants.length > 0 && products.length > 0 && (
            <div className="mb-3 text-sm text-ink">
              <ChemEquation
                reactants={reactants.map(rowToTerm)}
                products={products.map(rowToTerm)}
              />
            </div>
          )}
          <div className="flex flex-wrap gap-x-8 gap-y-3">
            <Stat label="ΔH°rxn" value={f1(result.dH)} unit="kJ/mol" />
            <Stat label="ΔS°rxn" value={f1(result.dS)} unit="J/(mol·K)" />
            <Stat label={`ΔG (${(num(tempC) ?? 25).toFixed(0)} °C)`} value={f1(result.dG)} unit="kJ/mol" />
            <Stat label="K" value={fmtK(result.K)} />
          </div>
          {result.crossoverT != null && (
            <p className="mt-3 text-xs text-ink-2">
              ΔG = 0 at{" "}
              <span className="font-semibold text-ink">
                {(result.crossoverT - 273.15).toFixed(0)} °C
              </span>{" "}
              — {result.dS > 0 ? "spontaneous above" : "spontaneous below"} this temperature.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Gibbs ─────────────────────────────────────────────────────
function GibbsPanel() {
  const [dH, setDH] = useState("-91.8");
  const [dS, setDS] = useState("-198.1");
  const [tempC, setTempC] = useState("25");

  const h = num(dH);
  const s = num(dS);
  const T = (num(tempC) ?? 25) + 273.15;
  const dG = h != null && s != null ? gibbs(h, s, T) : null;
  const K = dG != null ? kFromDG(dG, T) : null;
  const crossover = h != null && s != null && s !== 0 && h / s > 0 ? (h * 1000) / s - 273.15 : null;

  return (
    <div className="space-y-4">
      <p className="text-xs text-ink-2">ΔG = ΔH − TΔS. Enter reaction ΔH and ΔS to find ΔG and K at a temperature.</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Field label="ΔH" value={dH} onChange={setDH} unit="kJ/mol" inputMode="decimal" />
        <Field label="ΔS" value={dS} onChange={setDS} unit="J/(mol·K)" inputMode="decimal" />
        <Field label="Temperature" value={tempC} onChange={setTempC} unit="°C" inputMode="decimal" />
      </div>
      {dG != null && K != null && (
        <div className="rounded-ctrl bg-surface-2 p-4">
          <div className="mb-3">
            <SpontaneityBadge spontaneous={dG < 0} />
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-3">
            <Stat label="ΔG" value={f1(dG)} unit="kJ/mol" />
            <Stat label="K" value={fmtK(K)} />
          </div>
          {crossover != null && (
            <p className="mt-3 text-xs text-ink-2">
              ΔG changes sign at{" "}
              <span className="font-semibold text-ink">{crossover.toFixed(0)} °C</span>.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Calorimetry ───────────────────────────────────────────────
function CalorimetryPanel() {
  const [mass, setMass] = useState("100");
  const [c, setC] = useState("4.18");
  const [dT, setDT] = useState("6.5");
  const [moles, setMoles] = useState("");

  const m = num(mass);
  const cv = num(c);
  const dt = num(dT);
  const q = m != null && cv != null && dt != null ? heat(m, cv, dt) : null;
  const n = num(moles);
  const molarH = q != null && n != null && n > 0 ? -q / (1000 * n) : null;

  return (
    <div className="space-y-4">
      <p className="text-xs text-ink-2">q = m·c·ΔT. Specific heat of water is 4.18 J/(g·K).</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Field label="Mass" value={mass} onChange={setMass} unit="g" inputMode="decimal" />
        <Field label="Specific heat" value={c} onChange={setC} unit="J/(g·K)" inputMode="decimal" />
        <Field label="ΔT" value={dT} onChange={setDT} unit="K" inputMode="decimal" />
        <Field label="Moles reacted" value={moles} onChange={setMoles} unit="mol" inputMode="decimal" />
      </div>
      {q != null && (
        <div className="rounded-ctrl bg-surface-2 p-4">
          <div className="flex flex-wrap gap-x-8 gap-y-3">
            <Stat label="Heat q" value={q.toFixed(0)} unit="J" />
            <Stat label="q" value={(q / 1000).toFixed(2)} unit="kJ" />
            {molarH != null && (
              <Stat label="Molar ΔH" value={molarH.toFixed(1)} unit="kJ/mol" />
            )}
          </div>
          {molarH != null && (
            <p className="mt-2 text-xs text-ink-3">
              {molarH < 0 ? "Exothermic" : "Endothermic"} — sign follows the heat absorbed by the surroundings.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export function ThermoTool() {
  const [tab, setTab] = useState<"reaction" | "gibbs" | "calorimetry">("reaction");
  return (
    <Card className="p-5 lg:p-6">
      <h2 className="text-base font-semibold text-ink">Thermodynamics</h2>
      <p className="mb-4 mt-1 text-xs text-ink-2">
        Reaction enthalpy &amp; free energy from standard data (Hess's law), the
        Gibbs relation, equilibrium constants, and calorimetry.
      </p>
      <div className="mb-5">
        <SegmentedControl
          layoutId="thermo-tab"
          aria-label="Calculator"
          options={[
            { value: "reaction" as const, label: "Reaction (Hess's law)" },
            { value: "gibbs" as const, label: "Gibbs ΔG" },
            { value: "calorimetry" as const, label: "Calorimetry" },
          ]}
          value={tab}
          onChange={setTab}
        />
      </div>
      {tab === "reaction" && <ReactionPanel />}
      {tab === "gibbs" && <GibbsPanel />}
      {tab === "calorimetry" && <CalorimetryPanel />}
    </Card>
  );
}
