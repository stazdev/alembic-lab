/**
 * Electrochemistry generators — standard cell potential from two half-reactions,
 * and the Nernst equation at non-standard conditions. Keyed by the verified
 * electrochemistry engine and the reduction-potential table.
 */
import { standardCellPotential, nernst } from "@/lib/chemistry/electrochemistry";
import { REDUCTION_POTENTIALS } from "@/data/reductionPotentials";
import { draw } from "./build";
import { sigTolerance, fmt } from "./format";
import type { TaskGenerator } from "./types";

export const cellPotentialGen: TaskGenerator = {
  id: "echem-cell-potential",
  topic: "Electrochemistry",
  title: "Standard cell potential",
  difficulties: ["Core"],
  build({ rng }) {
    const { hi, lo } = draw(
      () => {
        const a = rng.pick(REDUCTION_POTENTIALS);
        const b = rng.pick(REDUCTION_POTENTIALS);
        const hi = a.E0 >= b.E0 ? a : b; // cathode (higher reduction potential)
        const lo = a.E0 >= b.E0 ? b : a; // anode
        return { hi, lo };
      },
      ({ hi, lo }) => hi.id !== lo.id && hi.E0 - lo.E0 > 0.1,
    );
    const ecell = standardCellPotential(hi.E0, lo.E0);
    return {
      title: "Standard cell potential",
      prompt: `A galvanic cell pairs these half-reactions:\n  ${hi.half}  (E° = ${fmt(hi.E0, 2)} V)\n  ${lo.half}  (E° = ${fmt(lo.E0, 2)} V)\nWhat is the standard cell potential E°cell (V)?`,
      given: [
        { label: "Half-reaction A", value: `${hi.half} — E° = ${fmt(hi.E0, 2)} V` },
        { label: "Half-reaction B", value: `${lo.half} — E° = ${fmt(lo.E0, 2)} V` },
      ],
      answer: { kind: "numeric", value: ecell, unit: "V", tolerance: sigTolerance(ecell, 2) },
      hints: [
        "The half-reaction with the higher reduction potential is the cathode; the other is the anode.",
        "E°cell = E°(cathode) − E°(anode); a positive value means a spontaneous (galvanic) cell.",
      ],
      solution: `E°cell = E°(cathode) − E°(anode) = ${fmt(hi.E0, 2)} − (${fmt(lo.E0, 2)}) = ${fmt(ecell, 2)} V.`,
      toolHref: "/reactions",
    };
  },
};

export const nernstGen: TaskGenerator = {
  id: "echem-nernst",
  topic: "Electrochemistry",
  title: "Nernst equation",
  difficulties: ["Challenge"],
  build({ rng }) {
    const p = draw(
      () => ({
        E0: rng.float(0.2, 1.6, 2),
        n: rng.pick([1, 2, 3] as const),
        logQ: rng.int(-3, 3),
      }),
      ({ logQ }) => logQ !== 0, // Q = 1 would make E = E°, too trivial
    );
    const Q = Math.pow(10, p.logQ);
    const E = nernst(p.E0, p.n, Q, 298.15);
    return {
      title: "Nernst equation",
      prompt: `A cell has E° = ${fmt(p.E0, 2)} V, n = ${p.n}, and reaction quotient Q = ${sciQ(p.logQ)}. What is the cell potential E (V) at 298 K?`,
      given: [
        { label: "E°", value: `${fmt(p.E0, 2)} V` },
        { label: "n", value: String(p.n) },
        { label: "Q", value: sciQ(p.logQ) },
      ],
      answer: { kind: "numeric", value: E, unit: "V", tolerance: sigTolerance(E, 3) },
      hints: [
        "Use the Nernst equation: E = E° − (RT/nF)·ln Q.",
        "At 298 K, RT/F ≈ 0.0257 V, so E = E° − (0.0257/n)·ln Q.",
      ],
      solution: `E = E° − (RT/nF)·ln Q = ${fmt(p.E0, 2)} − (0.0257/${p.n})·ln(${sciQ(p.logQ)}) = ${fmt(E, 3)} V.`,
      toolHref: "/reactions",
    };
  },
};

/** Render Q = 10^logQ as a tidy string (e.g. "1000" or "1e-3"). */
function sciQ(logQ: number): string {
  if (logQ >= 0) return String(Math.round(Math.pow(10, logQ)));
  return `1e${logQ}`;
}
