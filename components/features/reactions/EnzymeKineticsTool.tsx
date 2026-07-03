"use client";

import { useState, type ReactNode } from "react";
import { Plus, X } from "lucide-react";
import {
  lineweaverBurkFit,
  michaelisMenten,
} from "@/lib/chemistry/enzymeKinetics";
import { Field } from "@/components/ui/Field";
import { SegmentedControl } from "@/components/ui/SegmentedControl";

const num = (s: string): number | null => {
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : null;
};
const fmt = (n: number): string => {
  if (!Number.isFinite(n)) return "—";
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

// ── Michaelis–Menten saturation curve ─────────────────────────
function MMCurve({ vmax, km, s }: { vmax: number; km: number; s: number }) {
  const W = 360;
  const H = 200;
  const padL = 40;
  const padR = 12;
  const padT = 12;
  const padB = 28;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const smax = Math.max(km * 6, s * 1.25, 1);
  const xTo = (x: number) => padL + (x / smax) * plotW;
  const yTo = (v: number) => padT + (1 - v / (vmax || 1)) * plotH;

  const N = 60;
  const d = Array.from({ length: N + 1 }, (_, i) => {
    const x = (i / N) * smax;
    return `${i === 0 ? "M" : "L"}${xTo(x).toFixed(1)} ${yTo(michaelisMenten(vmax, km, x)).toFixed(1)}`;
  }).join(" ");
  const showKm = km > 0 && km <= smax;
  const showPt = s >= 0 && s <= smax;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      style={{ maxHeight: 220 }}
      role="img"
      aria-label="Reaction rate versus substrate concentration"
    >
      {[vmax, vmax / 2, 0].map((v, i) => (
        <line key={i} x1={padL} y1={yTo(v)} x2={W - padR} y2={yTo(v)} className="stroke-line" strokeWidth={1} />
      ))}
      <line x1={padL} y1={yTo(vmax)} x2={W - padR} y2={yTo(vmax)} className="stroke-ink-3" strokeWidth={1} strokeDasharray="3 3" />
      <line x1={padL} y1={padT} x2={padL} y2={padT + plotH} className="stroke-line-strong" />
      <line x1={padL} y1={padT + plotH} x2={W - padR} y2={padT + plotH} className="stroke-line-strong" />
      {showKm && (
        <>
          <line x1={xTo(km)} y1={yTo(vmax / 2)} x2={xTo(km)} y2={padT + plotH} className="stroke-accent-strong" strokeWidth={1.2} strokeDasharray="3 3" />
          <line x1={padL} y1={yTo(vmax / 2)} x2={xTo(km)} y2={yTo(vmax / 2)} className="stroke-accent-strong" strokeWidth={1} strokeDasharray="3 3" />
        </>
      )}
      <path d={d} fill="none" className="stroke-ink" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      {showPt && <circle cx={xTo(s)} cy={yTo(michaelisMenten(vmax, km, s))} r={3.5} className="fill-ink" />}
      <text x={padL - 5} y={yTo(vmax) + 3} textAnchor="end" className="fill-ink-3" fontSize={9}>Vmax</text>
      <text x={padL - 5} y={yTo(vmax / 2) + 3} textAnchor="end" className="fill-ink-3" fontSize={9}>½</text>
      <text x={padL - 5} y={yTo(0) + 3} textAnchor="end" className="fill-ink-3" fontSize={9}>0</text>
      {showKm && <text x={xTo(km)} y={H - 12} textAnchor="middle" className="fill-accent-strong" fontSize={9}>Km</text>}
      <text x={padL + plotW / 2} y={H - 1} textAnchor="middle" className="fill-ink-2" fontSize={9}>[S]</text>
      <text x={10} y={padT + plotH / 2} textAnchor="middle" className="fill-ink-2" fontSize={9} transform={`rotate(-90 10 ${padT + plotH / 2})`}>rate v</text>
    </svg>
  );
}

function MMPanel() {
  const [vmaxS, setVmax] = useState("100");
  const [kmS, setKm] = useState("5");
  const [sS, setS] = useState("5");

  const vmax = num(vmaxS);
  const km = num(kmS);
  const s = num(sS);
  const valid = vmax != null && vmax > 0 && km != null && km > 0 && s != null && s >= 0;
  const v = valid ? michaelisMenten(vmax, km, s) : null;

  return (
    <div className="space-y-4">
      <p className="text-xs text-ink-2">v = Vmax·[S] / (Km + [S]). Km is the [S] at which v = ½·Vmax.</p>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Vmax" value={vmaxS} onChange={setVmax} unit="µmol/min" inputMode="decimal" />
        <Field label="Km" value={kmS} onChange={setKm} unit="mM" inputMode="decimal" />
        <Field label="[S]" value={sS} onChange={setS} unit="mM" inputMode="decimal" />
      </div>
      {valid && v != null ? (
        <ResultCard>
          <MMCurve vmax={vmax} km={km} s={s} />
          <div className="mt-3 flex flex-wrap gap-x-8 gap-y-3">
            <Stat label="Rate v" value={fmt(v)} unit="µmol/min" />
            <Stat label="v / Vmax" value={fmt(v / vmax)} />
          </div>
        </ResultCard>
      ) : (
        <p className="text-xs text-ink-3">Enter positive Vmax, Km, and [S].</p>
      )}
    </div>
  );
}

// ── Lineweaver–Burk fit ───────────────────────────────────────
function LBPlot({
  points,
  slope,
  intercept,
}: {
  points: { s: number; v: number }[];
  slope: number;
  intercept: number;
}) {
  const xs = points.map((p) => 1 / p.s);
  const ys = points.map((p) => 1 / p.v);
  const xmax = Math.max(...xs, 0.0001) * 1.15;
  const ymax = Math.max(...ys, intercept, 0.0001) * 1.15;
  const W = 360;
  const H = 200;
  const padL = 46;
  const padR = 12;
  const padT = 12;
  const padB = 28;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const xTo = (x: number) => padL + (x / xmax) * plotW;
  const yTo = (y: number) => padT + (1 - y / ymax) * plotH;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 220 }} role="img" aria-label="Double reciprocal Lineweaver–Burk plot">
      <line x1={padL} y1={padT} x2={padL} y2={padT + plotH} className="stroke-line-strong" />
      <line x1={padL} y1={padT + plotH} x2={W - padR} y2={padT + plotH} className="stroke-line-strong" />
      {/* fit line across the plot */}
      <line
        x1={xTo(0)}
        y1={yTo(intercept)}
        x2={xTo(xmax)}
        y2={yTo(slope * xmax + intercept)}
        className="stroke-accent-strong"
        strokeWidth={1.6}
      />
      {points.map((_, i) => (
        <circle key={i} cx={xTo(xs[i])} cy={yTo(ys[i])} r={3.2} className="fill-ink" />
      ))}
      <text x={padL - 6} y={yTo(intercept) + 3} textAnchor="end" className="fill-ink-3" fontSize={9}>1/Vmax</text>
      <text x={padL + plotW / 2} y={H - 1} textAnchor="middle" className="fill-ink-2" fontSize={9}>1 / [S]</text>
      <text x={11} y={padT + plotH / 2} textAnchor="middle" className="fill-ink-2" fontSize={9} transform={`rotate(-90 11 ${padT + plotH / 2})`}>1 / v</text>
    </svg>
  );
}

function LBPanel() {
  const [rows, setRows] = useState([
    { s: "1", v: "16.7" },
    { s: "2", v: "28.6" },
    { s: "5", v: "50" },
    { s: "10", v: "66.7" },
    { s: "20", v: "80" },
  ]);

  const points = rows
    .map((r) => ({ s: num(r.s) ?? NaN, v: num(r.v) ?? NaN }))
    .filter((p) => Number.isFinite(p.s) && Number.isFinite(p.v) && p.s > 0 && p.v > 0);
  const fit = lineweaverBurkFit(points);

  const setRow = (i: number, key: "s" | "v", val: string) =>
    setRows((rs) => rs.map((r, j) => (j === i ? { ...r, [key]: val } : r)));
  const addRow = () => setRows((rs) => [...rs, { s: "", v: "" }]);
  const removeRow = (i: number) => setRows((rs) => rs.filter((_, j) => j !== i));

  return (
    <div className="space-y-4">
      <p className="text-xs text-ink-2">
        Enter (substrate, rate) pairs; a double-reciprocal fit recovers Vmax and Km.
      </p>
      <div className="space-y-2">
        <div className="grid grid-cols-[1fr_1fr_auto] gap-2 px-1 text-[11px] text-ink-3">
          <span>[S] (mM)</span>
          <span>v (µmol/min)</span>
          <span className="w-8" />
        </div>
        {rows.map((r, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_auto] items-center gap-2">
            <Field value={r.s} onChange={(val) => setRow(i, "s", val)} inputMode="decimal" aria-label={`substrate ${i + 1}`} />
            <Field value={r.v} onChange={(val) => setRow(i, "v", val)} inputMode="decimal" aria-label={`rate ${i + 1}`} />
            <button
              type="button"
              onClick={() => removeRow(i)}
              aria-label={`Remove row ${i + 1}`}
              className="grid h-9 w-8 place-items-center rounded-ctrl text-ink-3 transition hover:bg-surface-2 hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addRow}
          className="inline-flex h-9 items-center gap-1 rounded-ctrl border border-dashed border-line-strong px-3 text-xs font-medium text-ink-2 transition hover:border-ink-2 hover:text-ink"
        >
          <Plus className="h-3.5 w-3.5" /> Add point
        </button>
      </div>
      {fit.ok ? (
        <ResultCard>
          <LBPlot points={points} slope={fit.slope} intercept={fit.intercept} />
          <div className="mt-3 flex flex-wrap gap-x-8 gap-y-3">
            <Stat label="Vmax" value={fmt(fit.vmax)} unit="µmol/min" />
            <Stat label="Km" value={fmt(fit.km)} unit="mM" />
            <Stat label="R²" value={fit.r2.toFixed(4)} />
          </div>
        </ResultCard>
      ) : (
        <p className="text-xs text-ink-3">{fit.error}</p>
      )}
    </div>
  );
}

export function EnzymeKineticsTool() {
  const [mode, setMode] = useState<"mm" | "lb">("mm");
  return (
    <div className="space-y-5">
      <SegmentedControl
        layoutId="enzyme-mode"
        aria-label="Enzyme kinetics mode"
        options={[
          { value: "mm" as const, label: "Michaelis–Menten" },
          { value: "lb" as const, label: "Lineweaver–Burk fit" },
        ]}
        value={mode}
        onChange={setMode}
      />
      {mode === "mm" ? <MMPanel /> : <LBPanel />}
    </div>
  );
}
