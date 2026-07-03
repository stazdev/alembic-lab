"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import {
  cellEquilibriumK,
  cellGibbs,
  lcm,
  nernst,
  standardCellPotential,
} from "@/lib/chemistry/electrochemistry";
import {
  HALF_BY_ID,
  REDUCTION_POTENTIALS,
  type HalfReaction,
} from "@/data/reductionPotentials";
import { Field } from "@/components/ui/Field";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverClose,
} from "@/components/ui/Popover";

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

function HalfPicker({
  label,
  value,
  onSelect,
}: {
  label: string;
  value: HalfReaction;
  onSelect: (h: HalfReaction) => void;
}) {
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();
  const filtered = REDUCTION_POTENTIALS.filter(
    (h) => h.half.toLowerCase().includes(query) || h.id.toLowerCase().includes(query),
  );
  return (
    <div>
      <div className="mb-1 text-xs font-medium text-ink-2">{label}</div>
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex w-full items-center justify-between gap-2 rounded-ctrl border border-line bg-surface px-3 py-2.5 text-left text-sm text-ink transition hover:border-ink-2"
          >
            <span>{value.half}</span>
            <span className="flex shrink-0 items-center gap-2">
              <span className="tabular-nums text-ink-2">{value.E0.toFixed(2)} V</span>
              <ChevronDown className="h-4 w-4 text-ink-3" />
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent side="bottom" align="start" className="w-80 p-2">
          <Field
            value={q}
            onChange={setQ}
            placeholder="Search half-reactions…"
            aria-label="Search half-reactions"
            className="mb-2"
          />
          <div className="max-h-64 space-y-0.5 overflow-y-auto">
            {filtered.map((h) => (
              <PopoverClose asChild key={h.id}>
                <button
                  type="button"
                  onClick={() => onSelect(h)}
                  className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm text-ink transition hover:bg-surface-2"
                >
                  <span>{h.half}</span>
                  <span className="shrink-0 tabular-nums text-[11px] text-ink-3">
                    {h.E0.toFixed(2)} V
                  </span>
                </button>
              </PopoverClose>
            ))}
            {filtered.length === 0 && (
              <p className="px-2 py-2 text-xs text-ink-3">No match</p>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function SpontaneityBadge({ spontaneous }: { spontaneous: boolean }) {
  return spontaneous ? (
    <span className="rounded-pill bg-accent px-3 py-1 text-xs font-medium text-accent-ink">
      Spontaneous (E°cell &gt; 0)
    </span>
  ) : (
    <span className="rounded-pill bg-dark px-3 py-1 text-xs font-medium text-on-dark">
      Non-spontaneous (E°cell &lt; 0)
    </span>
  );
}

function CellPanel() {
  const [cathode, setCathode] = useState<HalfReaction>(HALF_BY_ID.Cu);
  const [anode, setAnode] = useState<HalfReaction>(HALF_BY_ID.Zn);

  const E0 = standardCellPotential(cathode.E0, anode.E0);
  const n = lcm(cathode.n, anode.n);
  const dG = cellGibbs(n, E0);
  const K = cellEquilibriumK(E0, n);
  const notation = `${anode.reduced} | ${anode.oxidized} || ${cathode.oxidized} | ${cathode.reduced}`;

  return (
    <div className="space-y-4">
      <p className="text-xs text-ink-2">
        Pick the reduction half-reaction at each electrode. The cathode is reduced;
        the anode is oxidized (its half-reaction runs in reverse).
      </p>
      <div className="grid gap-3 md:grid-cols-2">
        <HalfPicker label="Cathode (reduction)" value={cathode} onSelect={setCathode} />
        <HalfPicker label="Anode (oxidation)" value={anode} onSelect={setAnode} />
      </div>
      <ResultCard>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <SpontaneityBadge spontaneous={E0 > 0} />
          <span className="text-2xl font-semibold tabular-nums text-ink">
            {fmt(E0)}
            <span className="ml-1 text-sm font-normal text-ink-2">V</span>
          </span>
        </div>
        <div className="mb-3 rounded-ctrl bg-surface px-3 py-2 text-sm tabular-nums text-ink">
          {notation}
        </div>
        <div className="flex flex-wrap gap-x-8 gap-y-3">
          <Stat label="E°cell" value={fmt(E0)} unit="V" />
          <Stat label="Electrons (n)" value={String(n)} />
          <Stat label="ΔG°" value={fmt(dG)} unit="kJ/mol" />
          <Stat label="K" value={fmt(K)} />
        </div>
      </ResultCard>
    </div>
  );
}

function NernstPanel() {
  const [E0s, setE0] = useState("1.10");
  const [ns, setN] = useState("2");
  const [Qs, setQ] = useState("1");
  const [tempC, setTempC] = useState("25");

  const E0 = num(E0s);
  const n = num(ns);
  const Q = num(Qs);
  const T = num(tempC);
  const valid = E0 != null && n != null && n > 0 && Q != null && Q > 0 && T != null;
  const E = valid ? nernst(E0, n, Q, T + 273.15) : null;

  return (
    <div className="space-y-4">
      <p className="text-xs text-ink-2">
        E = E° − (RT/nF)·ln Q, where Q is the reaction quotient.
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Field label="E°cell" value={E0s} onChange={setE0} unit="V" inputMode="decimal" />
        <Field label="Electrons n" value={ns} onChange={setN} inputMode="decimal" />
        <Field label="Q" value={Qs} onChange={setQ} inputMode="decimal" />
        <Field label="Temperature" value={tempC} onChange={setTempC} unit="°C" inputMode="decimal" />
      </div>
      {E != null ? (
        <ResultCard>
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-sm text-ink-2">Cell potential E</span>
            <span className="text-2xl font-semibold tabular-nums text-ink">
              {fmt(E)}
              <span className="ml-1 text-sm font-normal text-ink-2">V</span>
            </span>
          </div>
        </ResultCard>
      ) : (
        <p className="text-xs text-ink-3">
          Enter E°, a positive n and Q, and a temperature.
        </p>
      )}
    </div>
  );
}

export function ElectrochemistryTool() {
  const [mode, setMode] = useState<"cell" | "nernst">("cell");
  return (
    <div className="space-y-5">
      <SegmentedControl
        layoutId="echem-mode"
        aria-label="Electrochemistry mode"
        options={[
          { value: "cell" as const, label: "Cell potential" },
          { value: "nernst" as const, label: "Nernst" },
        ]}
        value={mode}
        onChange={setMode}
      />
      {mode === "cell" ? <CellPanel /> : <NernstPanel />}
    </div>
  );
}
