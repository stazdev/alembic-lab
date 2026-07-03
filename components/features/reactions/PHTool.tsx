"use client";

import { useState } from "react";
import {
  bufferPH,
  pKaToKa,
  strongAcidPH,
  strongBasePH,
  titrateAcidWithBase,
  titrateBaseWithAcid,
  weakAcidPH,
  weakBasePH,
  type TitrationCurve,
} from "@/lib/chemistry/ph";
import { WEAK_ACIDS, WEAK_BASES } from "@/data/weakAcidsBases";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { cn } from "@/lib/utils";

const num = (s: string): number | null => {
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : null;
};
const f2 = (n: number): string => n.toFixed(2);
const sci = (n: number): string => n.toExponential(2);

// ── pH scale bar ──────────────────────────────────────────────
function PHScale({ ph }: { ph: number }) {
  const pct = (Math.max(0, Math.min(14, ph)) / 14) * 100;
  const zone = ph < 6.5 ? "Acidic" : ph > 7.5 ? "Basic" : "Neutral";
  return (
    <div>
      <div className="relative flex h-3 overflow-hidden rounded-pill">
        <div className="flex-1" style={{ backgroundColor: "#f0d5cb" }} />
        <div style={{ width: "8%", backgroundColor: "#edefe9" }} />
        <div className="flex-1" style={{ backgroundColor: "#d2e1ed" }} />
        <span
          className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface bg-ink"
          style={{ left: `${pct}%` }}
        />
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-ink-3">
        <span>0</span>
        <span>7</span>
        <span>14</span>
      </div>
      <div className="mt-0.5 text-xs font-medium text-ink-2">{zone}</div>
    </div>
  );
}

function PHResult({ ph }: { ph: number }) {
  const h = Math.pow(10, -ph);
  const oh = 1e-14 / h;
  return (
    <div className="rounded-ctrl bg-surface-2 p-4">
      <div className="mb-3 flex items-baseline gap-3">
        <span className="text-xs text-ink-3">pH</span>
        <span className="text-3xl font-semibold tabular-nums text-ink">{f2(ph)}</span>
        <span className="text-xs text-ink-3">pOH {f2(14 - ph)}</span>
      </div>
      <PHScale ph={ph} />
      <div className="mt-3 flex flex-wrap gap-x-8 gap-y-1 text-xs text-ink-2">
        <span>[H⁺] = {sci(h)} M</span>
        <span>[OH⁻] = {sci(oh)} M</span>
      </div>
    </div>
  );
}

// ── pH calculator ─────────────────────────────────────────────
type CalcMode = "strongAcid" | "strongBase" | "weakAcid" | "weakBase" | "buffer";

const CALC_MODES = [
  { value: "strongAcid" as const, label: "Strong acid" },
  { value: "strongBase" as const, label: "Strong base" },
  { value: "weakAcid" as const, label: "Weak acid" },
  { value: "weakBase" as const, label: "Weak base" },
  { value: "buffer" as const, label: "Buffer" },
];

function PresetChips({
  presets,
  onPick,
}: {
  presets: { name: string; pK: number }[];
  onPick: (pK: number) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {presets.map((p) => (
        <button
          key={p.name}
          type="button"
          onClick={() => onPick(p.pK)}
          className="rounded-pill border border-line bg-surface px-2.5 py-1 text-[11px] font-medium text-ink-2 transition hover:border-line-strong hover:text-ink"
        >
          {p.name}
        </button>
      ))}
    </div>
  );
}

function PHCalculatorPanel() {
  const [mode, setMode] = useState<CalcMode>("weakAcid");
  const [conc, setConc] = useState("0.1");
  const [pKa, setPKa] = useState("4.76");
  const [pKb, setPKb] = useState("4.75");
  const [ha, setHA] = useState("0.1");
  const [a, setA] = useState("0.1");
  const [bufPKa, setBufPKa] = useState("4.76");

  const c = num(conc);
  let ph: number | null = null;
  if ((mode === "strongAcid" || mode === "strongBase" || mode === "weakAcid" || mode === "weakBase") && c != null && c > 0) {
    if (mode === "strongAcid") ph = strongAcidPH(c);
    else if (mode === "strongBase") ph = strongBasePH(c);
    else if (mode === "weakAcid" && num(pKa) != null) ph = weakAcidPH(c, pKaToKa(num(pKa)!));
    else if (mode === "weakBase" && num(pKb) != null) ph = weakBasePH(c, pKaToKa(num(pKb)!));
  } else if (mode === "buffer") {
    const nha = num(ha);
    const na = num(a);
    const pk = num(bufPKa);
    if (nha != null && nha > 0 && na != null && na > 0 && pk != null) ph = bufferPH(pk, nha, na);
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto pb-1">
        <SegmentedControl
          layoutId="ph-calc-mode"
          aria-label="Acid–base type"
          options={CALC_MODES}
          value={mode}
          onChange={setMode}
        />
      </div>

      {mode === "buffer" ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field label="pKa" value={bufPKa} onChange={setBufPKa} inputMode="decimal" />
          <Field label="Acid [HA]" value={ha} onChange={setHA} unit="mol" inputMode="decimal" />
          <Field label="Conjugate base [A⁻]" value={a} onChange={setA} unit="mol" inputMode="decimal" />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Concentration" value={conc} onChange={setConc} unit="mol/L" inputMode="decimal" />
            {mode === "weakAcid" && <Field label="pKa" value={pKa} onChange={setPKa} inputMode="decimal" />}
            {mode === "weakBase" && <Field label="pKb" value={pKb} onChange={setPKb} inputMode="decimal" />}
          </div>
          {mode === "weakAcid" && <PresetChips presets={WEAK_ACIDS} onPick={(p) => setPKa(String(p))} />}
          {mode === "weakBase" && <PresetChips presets={WEAK_BASES} onPick={(p) => setPKb(String(p))} />}
        </div>
      )}

      {ph != null && Number.isFinite(ph) ? (
        <PHResult ph={ph} />
      ) : (
        <p className="text-xs text-ink-3">Enter the values above to compute the pH.</p>
      )}
    </div>
  );
}

// ── Titration ─────────────────────────────────────────────────
function TitrationChart({ curve, xLabel }: { curve: TitrationCurve; xLabel: string }) {
  const W = 360;
  const H = 220;
  const padL = 30;
  const padR = 12;
  const padT = 10;
  const padB = 28;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const xmax = curve.maxVolume || 1;
  const xTo = (v: number) => padL + (v / xmax) * plotW;
  const yTo = (ph: number) => padT + (1 - ph / 14) * plotH;
  const d = curve.points
    .map((p, i) => `${i === 0 ? "M" : "L"}${xTo(p.volume).toFixed(1)} ${yTo(p.ph).toFixed(1)}`)
    .join(" ");
  const eqX = xTo(curve.equivalenceVolume);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 240 }} role="img" aria-label="Titration curve">
      {[0, 7, 14].map((ph) => (
        <g key={ph}>
          <line x1={padL} y1={yTo(ph)} x2={W - padR} y2={yTo(ph)} className="stroke-line" strokeWidth={1} />
          <text x={padL - 5} y={yTo(ph) + 3} textAnchor="end" className="fill-ink-3" fontSize={9}>
            {ph}
          </text>
        </g>
      ))}
      <line x1={padL} y1={padT} x2={padL} y2={padT + plotH} className="stroke-line-strong" />
      <line x1={eqX} y1={padT} x2={eqX} y2={padT + plotH} className="stroke-accent-strong" strokeWidth={1.2} strokeDasharray="3 3" />
      <path d={d} fill="none" className="stroke-ink" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={eqX} cy={yTo(curve.equivalencePH)} r={3.5} className="fill-accent stroke-ink" strokeWidth={1} />
      {[0, curve.equivalenceVolume, xmax].map((v, i) => (
        <text key={i} x={xTo(v)} y={H - 12} textAnchor="middle" className="fill-ink-3" fontSize={9}>
          {v < 10 ? v.toFixed(1) : v.toFixed(0)}
        </text>
      ))}
      <text x={padL + plotW / 2} y={H - 1} textAnchor="middle" className="fill-ink-2" fontSize={9}>
        {xLabel}
      </text>
      <text x={9} y={padT + plotH / 2} textAnchor="middle" className="fill-ink-2" fontSize={9} transform={`rotate(-90 9 ${padT + plotH / 2})`}>
        pH
      </text>
    </svg>
  );
}

function TitrationPanel() {
  const [mode, setMode] = useState<"acid" | "base">("acid");
  const [strong, setStrong] = useState(false);
  const [conc, setConc] = useState("0.1");
  const [vol, setVol] = useState("25");
  const [pK, setPK] = useState("4.76");
  const [titrant, setTitrant] = useState("0.1");

  const c = num(conc);
  const v = num(vol);
  const tc = num(titrant);
  const pk = num(pK);
  const valid = c != null && c > 0 && v != null && v > 0 && tc != null && tc > 0 && (strong || pk != null);

  const curve =
    valid
      ? mode === "acid"
        ? titrateAcidWithBase({ analyteConc: c, analyteVol: v, pK: strong ? null : pk, titrantConc: tc })
        : titrateBaseWithAcid({ analyteConc: c, analyteVol: v, pK: strong ? null : pk, titrantConc: tc })
      : null;

  const presets = mode === "acid" ? WEAK_ACIDS : WEAK_BASES;
  const pkLabel = mode === "acid" ? "pKa" : "pKb";
  const xLabel = mode === "acid" ? "mL of strong base added" : "mL of strong acid added";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <SegmentedControl
          layoutId="titration-mode"
          aria-label="Titration type"
          options={[
            { value: "acid" as const, label: "Acid + strong base" },
            { value: "base" as const, label: "Base + strong acid" },
          ]}
          value={mode}
          onChange={setMode}
        />
        <SegmentedControl
          layoutId="titration-strength"
          aria-label="Analyte strength"
          options={[
            { value: "weak" as const, label: "Weak" },
            { value: "strong" as const, label: "Strong" },
          ]}
          value={strong ? "strong" : "weak"}
          onChange={(val) => setStrong(val === "strong")}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Field label="Analyte conc." value={conc} onChange={setConc} unit="mol/L" inputMode="decimal" />
        <Field label="Analyte volume" value={vol} onChange={setVol} unit="mL" inputMode="decimal" />
        {!strong && <Field label={pkLabel} value={pK} onChange={setPK} inputMode="decimal" />}
        <Field label="Titrant conc." value={titrant} onChange={setTitrant} unit="mol/L" inputMode="decimal" />
      </div>

      {!strong && <PresetChips presets={presets} onPick={(p) => setPK(String(p))} />}

      {curve ? (
        <div className="rounded-ctrl bg-surface-2 p-4">
          <TitrationChart curve={curve} xLabel={xLabel} />
          <div className="mt-3 flex flex-wrap gap-x-8 gap-y-1 text-xs">
            <span className="text-ink-2">
              Equivalence:{" "}
              <span className="font-semibold text-ink">
                {curve.equivalenceVolume.toFixed(1)} mL
              </span>{" "}
              at pH{" "}
              <span className="font-semibold text-ink">{f2(curve.equivalencePH)}</span>
            </span>
            {!strong && (
              <span className="text-ink-2">
                Half-equivalence pH ={" "}
                <span className="font-semibold text-ink">{f2(curve.halfEquivalencePH)}</span>{" "}
                (= {pkLabel === "pKa" ? "pKa" : "14 − pKb"})
              </span>
            )}
          </div>
        </div>
      ) : (
        <p className="text-xs text-ink-3">Enter valid concentrations and volume to plot the curve.</p>
      )}
    </div>
  );
}

// ── shell ─────────────────────────────────────────────────────
export function PHTool() {
  const [tab, setTab] = useState<"calc" | "titration">("calc");

  return (
    <Card className="p-5 lg:p-6">
      <h2 className="text-base font-semibold text-ink">pH &amp; Titration</h2>
      <p className="mb-4 mt-1 text-xs text-ink-2">
        Compute pH for strong/weak acids, bases, and buffers, or plot a full
        titration curve with its equivalence point.
      </p>

      <div className="mb-5">
        <SegmentedControl
          layoutId="ph-tab"
          aria-label="Tool"
          options={[
            { value: "calc" as const, label: "pH calculator" },
            { value: "titration" as const, label: "Titration curve" },
          ]}
          value={tab}
          onChange={setTab}
        />
      </div>

      {tab === "calc" ? <PHCalculatorPanel /> : <TitrationPanel />}
    </Card>
  );
}
