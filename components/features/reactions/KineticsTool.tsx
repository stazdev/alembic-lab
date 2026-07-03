"use client";

import { useState } from "react";
import {
  activationEnergy,
  arrheniusK,
  decayCurve,
  halfLife,
  integratedLaw,
  rate,
  rateConstantUnit,
  type DecayPoint,
  type Order,
} from "@/lib/chemistry/kinetics";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { SegmentedControl } from "@/components/ui/SegmentedControl";

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

// ── decay chart ───────────────────────────────────────────────
function KineticsChart({
  points,
  a0,
  tmax,
  tHalf,
}: {
  points: DecayPoint[];
  a0: number;
  tmax: number;
  tHalf: number;
}) {
  const W = 360;
  const H = 200;
  const padL = 34;
  const padR = 12;
  const padT = 10;
  const padB = 26;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const xTo = (t: number) => padL + (t / (tmax || 1)) * plotW;
  const yTo = (c: number) => padT + (1 - c / (a0 || 1)) * plotH;
  const d = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${xTo(p.t).toFixed(1)} ${yTo(p.conc).toFixed(1)}`)
    .join(" ");
  const showHalf = tHalf > 0 && tHalf <= tmax;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 220 }} role="img" aria-label="Concentration versus time">
      {[a0, a0 / 2, 0].map((c, i) => (
        <line key={i} x1={padL} y1={yTo(c)} x2={W - padR} y2={yTo(c)} className="stroke-line" strokeWidth={1} />
      ))}
      <line x1={padL} y1={padT} x2={padL} y2={padT + plotH} className="stroke-line-strong" />
      <line x1={padL} y1={padT + plotH} x2={W - padR} y2={padT + plotH} className="stroke-line-strong" />
      {showHalf && (
        <>
          <line x1={xTo(tHalf)} y1={padT} x2={xTo(tHalf)} y2={padT + plotH} className="stroke-accent-strong" strokeWidth={1.2} strokeDasharray="3 3" />
          <line x1={padL} y1={yTo(a0 / 2)} x2={xTo(tHalf)} y2={yTo(a0 / 2)} className="stroke-accent-strong" strokeWidth={1} strokeDasharray="3 3" />
        </>
      )}
      <path d={d} fill="none" className="stroke-ink" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      <text x={padL - 5} y={yTo(a0) + 3} textAnchor="end" className="fill-ink-3" fontSize={9}>{fmt(a0)}</text>
      <text x={padL - 5} y={yTo(0) + 3} textAnchor="end" className="fill-ink-3" fontSize={9}>0</text>
      <text x={padL} y={H - 12} textAnchor="middle" className="fill-ink-3" fontSize={9}>0</text>
      {showHalf && (
        <text x={xTo(tHalf)} y={H - 12} textAnchor="middle" className="fill-accent-strong" fontSize={9}>t½</text>
      )}
      <text x={W - padR} y={H - 12} textAnchor="end" className="fill-ink-3" fontSize={9}>{fmt(tmax)}</text>
      <text x={padL + plotW / 2} y={H - 1} textAnchor="middle" className="fill-ink-2" fontSize={9}>time (s)</text>
      <text x={9} y={padT + plotH / 2} textAnchor="middle" className="fill-ink-2" fontSize={9} transform={`rotate(-90 9 ${padT + plotH / 2})`}>[A] (M)</text>
    </svg>
  );
}

// ── rate law ──────────────────────────────────────────────────
function RateLawPanel() {
  const [k, setK] = useState("0.05");
  const [ca, setCA] = useState("0.5");
  const [oa, setOA] = useState("1");
  const [cb, setCB] = useState("0.5");
  const [ob, setOB] = useState("2");

  const kv = num(k);
  const a = num(ca);
  const ma = num(oa);
  const b = num(cb);
  const mb = num(ob);

  const terms: { conc: number; order: number }[] = [];
  if (a != null && ma != null) terms.push({ conc: a, order: ma });
  if (b != null && mb != null) terms.push({ conc: b, order: mb });
  const r = kv != null && terms.length > 0 ? rate(kv, terms) : null;
  const overall = (ma ?? 0) + (b != null ? (mb ?? 0) : 0);

  return (
    <div className="space-y-4">
      <p className="text-xs text-ink-2">rate = k · [A]^m · [B]^n. Leave [B] blank for a single reactant.</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Field label="k" value={k} onChange={setK} inputMode="decimal" />
        <Field label="[A]" value={ca} onChange={setCA} unit="M" inputMode="decimal" />
        <Field label="order m" value={oa} onChange={setOA} inputMode="decimal" />
        <Field label="[B]" value={cb} onChange={setCB} unit="M" inputMode="decimal" />
        <Field label="order n" value={ob} onChange={setOB} inputMode="decimal" />
      </div>
      {r != null ? (
        <div className="rounded-ctrl bg-surface-2 p-4">
          <div className="flex flex-wrap gap-x-8 gap-y-3">
            <Stat label="Rate" value={fmt(r)} unit="M·s⁻¹" />
            <Stat label="Overall order" value={String(overall)} />
          </div>
        </div>
      ) : (
        <p className="text-xs text-ink-3">Enter k and at least one concentration.</p>
      )}
    </div>
  );
}

// ── integrated rate law ───────────────────────────────────────
const ORDER_OPTIONS = [
  { value: "0" as const, label: "Zero order" },
  { value: "1" as const, label: "First order" },
  { value: "2" as const, label: "Second order" },
];

function IntegratedPanel() {
  const [order, setOrder] = useState<"0" | "1" | "2">("1");
  const [a0s, setA0] = useState("1.0");
  const [ks, setKs] = useState("0.1");

  const ord = Number(order) as Order;
  const a0 = num(a0s);
  const k = num(ks);
  const valid = a0 != null && a0 > 0 && k != null && k > 0;

  let content = null;
  if (valid) {
    const tHalf = halfLife(a0, k, ord);
    const tmax = ord === 0 ? a0 / k : tHalf * 5;
    const points = decayCurve(a0, k, ord, tmax);
    const law = integratedLaw(ord);
    content = (
      <div className="rounded-ctrl bg-surface-2 p-4">
        <KineticsChart points={points} a0={a0} tmax={tmax} tHalf={tHalf} />
        <div className="mt-3 flex flex-wrap gap-x-8 gap-y-3">
          <Stat label="Half-life t½" value={fmt(tHalf)} unit="s" />
          <div>
            <div className="text-xs text-ink-3">Integrated law</div>
            <div className="text-sm font-medium text-ink">{law.law}</div>
          </div>
          <div>
            <div className="text-xs text-ink-3">Linear plot</div>
            <div className="text-sm font-medium text-ink">{law.linear}</div>
          </div>
        </div>
        <p className="mt-2 text-xs text-ink-3">
          {ord === 1
            ? "First-order half-life is constant — independent of concentration."
            : ord === 0
              ? "Zero-order half-life shortens as the reaction proceeds."
              : "Second-order half-life lengthens as concentration drops."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto pb-1">
        <SegmentedControl
          layoutId="kinetics-order"
          aria-label="Reaction order"
          options={ORDER_OPTIONS}
          value={order}
          onChange={setOrder}
        />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Field label="[A]₀" value={a0s} onChange={setA0} unit="M" inputMode="decimal" />
        <Field label="k" value={ks} onChange={setKs} unit={rateConstantUnit(ord)} inputMode="decimal" />
      </div>
      {content ?? <p className="text-xs text-ink-3">Enter a positive [A]₀ and k.</p>}
    </div>
  );
}

// ── Arrhenius ─────────────────────────────────────────────────
function ArrheniusPanel() {
  const [mode, setMode] = useState<"k" | "ea">("k");
  const [preExp, setPreExp] = useState("1e13");
  const [ea, setEa] = useState("75");
  const [tempC, setTempC] = useState("25");
  const [k1, setK1] = useState("1");
  const [t1, setT1] = useState("27");
  const [k2, setK2] = useState("2");
  const [t2, setT2] = useState("37");

  let result = null;
  if (mode === "k") {
    const A = num(preExp);
    const e = num(ea);
    const T = num(tempC);
    if (A != null && e != null && T != null) {
      result = <Stat label="k" value={fmt(arrheniusK(A, e, T + 273.15))} unit="s⁻¹" />;
    }
  } else {
    const kk1 = num(k1);
    const tt1 = num(t1);
    const kk2 = num(k2);
    const tt2 = num(t2);
    if (kk1 != null && kk1 > 0 && kk2 != null && kk2 > 0 && tt1 != null && tt2 != null && tt1 !== tt2) {
      result = <Stat label="Activation energy Eₐ" value={fmt(activationEnergy(kk1, tt1 + 273.15, kk2, tt2 + 273.15))} unit="kJ/mol" />;
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-ink-2">k = A·e^(−Eₐ/RT). Find k from the parameters, or Eₐ from two temperatures.</p>
      <SegmentedControl
        layoutId="arrhenius-mode"
        aria-label="Arrhenius mode"
        options={[
          { value: "k" as const, label: "Find k" },
          { value: "ea" as const, label: "Find Eₐ" },
        ]}
        value={mode}
        onChange={setMode}
      />
      {mode === "k" ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field label="Pre-exponential A" value={preExp} onChange={setPreExp} inputMode="decimal" />
          <Field label="Eₐ" value={ea} onChange={setEa} unit="kJ/mol" inputMode="decimal" />
          <Field label="Temperature" value={tempC} onChange={setTempC} unit="°C" inputMode="decimal" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Field label="k₁" value={k1} onChange={setK1} inputMode="decimal" />
          <Field label="T₁" value={t1} onChange={setT1} unit="°C" inputMode="decimal" />
          <Field label="k₂" value={k2} onChange={setK2} inputMode="decimal" />
          <Field label="T₂" value={t2} onChange={setT2} unit="°C" inputMode="decimal" />
        </div>
      )}
      {result ? (
        <div className="rounded-ctrl bg-surface-2 p-4">{result}</div>
      ) : (
        <p className="text-xs text-ink-3">Enter the values above.</p>
      )}
    </div>
  );
}

export function KineticsTool() {
  const [tab, setTab] = useState<"rate" | "integrated" | "arrhenius">("integrated");
  return (
    <Card className="p-5 lg:p-6">
      <h2 className="text-base font-semibold text-ink">Kinetics</h2>
      <p className="mb-4 mt-1 text-xs text-ink-2">
        Rate laws, integrated rate laws with decay curves and half-lives, and the
        Arrhenius temperature dependence.
      </p>
      <div className="mb-5">
        <SegmentedControl
          layoutId="kinetics-tab"
          aria-label="Calculator"
          options={[
            { value: "rate" as const, label: "Rate law" },
            { value: "integrated" as const, label: "Integrated (order)" },
            { value: "arrhenius" as const, label: "Arrhenius" },
          ]}
          value={tab}
          onChange={setTab}
        />
      </div>
      {tab === "rate" && <RateLawPanel />}
      {tab === "integrated" && <IntegratedPanel />}
      {tab === "arrhenius" && <ArrheniusPanel />}
    </Card>
  );
}
