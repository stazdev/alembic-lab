"use client";

import { useState, type ReactNode } from "react";
import {
  solveCombined,
  solveIdeal,
  type CombinedVar,
  type GasVar,
} from "@/lib/chemistry/gasLaws";
import { Field } from "@/components/ui/Field";
import { SegmentedControl } from "@/components/ui/SegmentedControl";

const fmt = (n: number): string => Number(n.toPrecision(4)).toString();
const parse = (s: string): number | undefined => {
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : undefined;
};

type Mode = "ideal" | "combined";
const MODES = [
  { value: "ideal" as const, label: "Ideal gas law" },
  { value: "combined" as const, label: "Combined gas law" },
];

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

function PresetRow({ presets }: { presets: { label: string; set: () => void }[] }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      <span className="shrink-0 text-xs text-ink-3">Examples:</span>
      {presets.map((p) => (
        <button
          key={p.label}
          type="button"
          onClick={p.set}
          className="shrink-0 rounded-pill border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink-2 transition hover:border-line-strong hover:text-ink"
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

// ── Ideal gas law ─────────────────────────────────────────────
const IDEAL_LABELS: Record<GasVar, string> = {
  P: "Pressure (P)",
  V: "Volume (V)",
  n: "Moles (n)",
  T: "Temperature (T)",
};
const IDEAL_UNITS: Record<GasVar, string> = { P: "atm", V: "L", n: "mol", T: "K" };
const IDEAL_KEYS: GasVar[] = ["P", "V", "n", "T"];

function IdealPanel() {
  const [P, setP] = useState("1");
  const [V, setV] = useState("");
  const [n, setN] = useState("1");
  const [T, setT] = useState("273.15");

  const values: Record<GasVar, string> = { P, V, n, T };
  const setters: Record<GasVar, (s: string) => void> = {
    P: setP,
    V: setV,
    n: setN,
    T: setT,
  };
  const res = solveIdeal({ P: parse(P), V: parse(V), n: parse(n), T: parse(T) });

  const presets = [
    { label: "Moles at STP", set: () => { setP("1"); setV("22.414"); setN(""); setT("273.15"); } },
    { label: "Volume, 1 mol at RTP", set: () => { setP("1"); setV(""); setN("1"); setT("298.15"); } },
    { label: "Pressure of 2 mol", set: () => { setP(""); setV("10"); setN("2"); setT("300"); } },
  ];

  return (
    <div className="space-y-4">
      <PresetRow presets={presets} />
      <p className="text-xs text-ink-3">Leave exactly one field blank to solve for it.</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {IDEAL_KEYS.map((k) => (
          <Field
            key={k}
            label={IDEAL_LABELS[k]}
            value={values[k]}
            onChange={setters[k]}
            unit={IDEAL_UNITS[k]}
            inputMode="decimal"
          />
        ))}
      </div>
      {res.ok ? (
        <ResultCard>
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <span className="text-sm text-ink-2">
              Solved for {IDEAL_LABELS[res.solvedFor]}
            </span>
            <span className="text-2xl font-semibold tabular-nums text-ink">
              {fmt(res.value)}
              <span className="ml-1 text-sm font-normal text-ink-2">
                {IDEAL_UNITS[res.solvedFor]}
              </span>
            </span>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {IDEAL_KEYS.map((k) => (
              <Stat key={k} label={k} value={fmt(res.all[k])} unit={IDEAL_UNITS[k]} />
            ))}
          </div>
          <p className="mt-3 text-xs text-ink-3">
            PV = nRT · R = 0.08206 L·atm·mol⁻¹·K⁻¹
          </p>
        </ResultCard>
      ) : (
        <p className="text-sm text-ink-3">{res.error}</p>
      )}
    </div>
  );
}

// ── Combined gas law ──────────────────────────────────────────
const COMBINED_LABELS: Record<CombinedVar, string> = {
  P1: "P₁",
  V1: "V₁",
  T1: "T₁",
  P2: "P₂",
  V2: "V₂",
  T2: "T₂",
};
const COMBINED_UNITS: Record<CombinedVar, string> = {
  P1: "atm",
  V1: "L",
  T1: "K",
  P2: "atm",
  V2: "L",
  T2: "K",
};

function CombinedPanel() {
  const [P1, setP1] = useState("1");
  const [V1, setV1] = useState("2");
  const [T1, setT1] = useState("300");
  const [P2, setP2] = useState("1");
  const [V2, setV2] = useState("");
  const [T2, setT2] = useState("600");

  const values: Record<CombinedVar, string> = { P1, V1, T1, P2, V2, T2 };
  const setters: Record<CombinedVar, (s: string) => void> = {
    P1: setP1,
    V1: setV1,
    T1: setT1,
    P2: setP2,
    V2: setV2,
    T2: setT2,
  };
  const res = solveCombined({
    P1: parse(P1),
    V1: parse(V1),
    T1: parse(T1),
    P2: parse(P2),
    V2: parse(V2),
    T2: parse(T2),
  });

  const presets = [
    { label: "Boyle (T const)", set: () => { setP1("1"); setV1("2"); setT1("300"); setP2(""); setV2("1"); setT2("300"); } },
    { label: "Charles (P const)", set: () => { setP1("1"); setV1("2"); setT1("300"); setP2("1"); setV2(""); setT2("600"); } },
    { label: "Gay-Lussac (V const)", set: () => { setP1("1"); setV1("1"); setT1("300"); setP2(""); setV2("1"); setT2("600"); } },
  ];

  const group = (keys: CombinedVar[], title: string) => (
    <div className="rounded-ctrl border border-line p-3">
      <div className="mb-2 text-xs font-medium text-ink-2">{title}</div>
      <div className="grid grid-cols-3 gap-2">
        {keys.map((k) => (
          <Field
            key={k}
            label={COMBINED_LABELS[k]}
            value={values[k]}
            onChange={setters[k]}
            unit={COMBINED_UNITS[k]}
            inputMode="decimal"
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <PresetRow presets={presets} />
      <p className="text-xs text-ink-3">Leave exactly one field blank to solve for it.</p>
      <div className="grid gap-3 md:grid-cols-2">
        {group(["P1", "V1", "T1"], "State 1")}
        {group(["P2", "V2", "T2"], "State 2")}
      </div>
      {res.ok ? (
        <ResultCard>
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-sm text-ink-2">
              Solved for {COMBINED_LABELS[res.solvedFor]}
            </span>
            <span className="text-2xl font-semibold tabular-nums text-ink">
              {fmt(res.value)}
              <span className="ml-1 text-sm font-normal text-ink-2">
                {COMBINED_UNITS[res.solvedFor]}
              </span>
            </span>
          </div>
          <p className="mt-3 text-xs text-ink-3">P₁V₁ / T₁ = P₂V₂ / T₂</p>
        </ResultCard>
      ) : (
        <p className="text-sm text-ink-3">{res.error}</p>
      )}
    </div>
  );
}

export function GasLawsTool() {
  const [mode, setMode] = useState<Mode>("ideal");
  return (
    <div className="space-y-5">
      <SegmentedControl
        layoutId="gaslaw-mode"
        aria-label="Gas law"
        options={MODES}
        value={mode}
        onChange={setMode}
      />
      {mode === "ideal" ? <IdealPanel /> : <CombinedPanel />}
    </div>
  );
}
