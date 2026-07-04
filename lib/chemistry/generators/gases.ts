/**
 * Gas-law generators — ideal (PV=nRT) and combined (P₁V₁/T₁=P₂V₂/T₂). The
 * parameters are sampled to a physically consistent state, then one variable is
 * hidden and recovered by the verified solver, which is the answer key.
 */
import { solveIdeal, solveCombined, R_L_ATM } from "@/lib/chemistry/gasLaws";
import { draw } from "./build";
import { sigTolerance, fmt } from "./format";
import type { GasVar } from "@/lib/chemistry/gasLaws";
import type { TaskGenerator } from "./types";

const UNIT: Record<GasVar, string> = { P: "atm", V: "L", n: "mol", T: "K" };
const LABEL: Record<GasVar, string> = { P: "P", V: "V", n: "n", T: "T" };

export const idealGasGen: TaskGenerator = {
  id: "gas-ideal",
  topic: "Gas Laws",
  title: "Ideal gas law",
  difficulties: ["Core", "Challenge"],
  build({ rng }) {
    const p = draw(
      () => {
        const n = rng.float(0.2, 3, 2);
        const T = rng.int(250, 500);
        const V = rng.float(1, 40, 1);
        const P = (n * R_L_ATM * T) / V;
        const solveFor = rng.pick(["P", "V", "n", "T"] as const);
        return { n, T, V, P, solveFor };
      },
      ({ P }) => P > 0.2 && P < 20, // realistic pressures
    );
    const full: Record<GasVar, number> = { P: p.P, V: p.V, n: p.n, T: p.T };
    const known: Partial<Record<GasVar, number>> = { ...full };
    delete known[p.solveFor];
    const res = solveIdeal(known);
    if (!res.ok) throw new Error(res.error);
    const value = res.value;
    const given = (Object.keys(known) as GasVar[]).map((k) => ({
      label: LABEL[k],
      value: `${fmt(known[k]!, 2)} ${UNIT[k]}`,
    }));
    return {
      title: "Ideal gas law",
      prompt: `A gas sample has ${given.map((g) => `${g.label} = ${g.value}`).join(", ")}. Find ${LABEL[p.solveFor]} (${UNIT[p.solveFor]}).`,
      given,
      answer: { kind: "numeric", value, unit: UNIT[p.solveFor], tolerance: sigTolerance(value, 2) },
      hints: [
        "Rearrange PV = nRT for the unknown.",
        `Use R = ${R_L_ATM} L·atm·mol⁻¹·K⁻¹; the temperature is already in kelvin.`,
      ],
      solution: `PV = nRT  ⇒  ${LABEL[p.solveFor]} = ${fmt(value, 2)} ${UNIT[p.solveFor]}`,
      toolHref: "/reactions",
    };
  },
};

export const combinedGasGen: TaskGenerator = {
  id: "gas-combined",
  topic: "Gas Laws",
  title: "Combined gas law",
  difficulties: ["Core"],
  build({ rng }) {
    const p = draw(
      () => {
        const P1 = rng.float(0.8, 3, 2);
        const V1 = rng.float(1, 20, 1);
        const T1 = rng.int(250, 400);
        const P2 = rng.float(0.8, 3, 2);
        const T2 = rng.int(250, 500);
        const V2 = (P1 * V1 * T2) / (T1 * P2);
        return { P1, V1, T1, P2, T2, V2 };
      },
      ({ V2 }) => V2 > 0.5 && V2 < 80,
    );
    const res = solveCombined({ P1: p.P1, V1: p.V1, T1: p.T1, P2: p.P2, T2: p.T2 });
    if (!res.ok) throw new Error(res.error);
    const v2 = res.value;
    return {
      title: "Combined gas law",
      prompt: `A gas occupies ${fmt(p.V1, 1)} L at ${fmt(p.P1, 2)} atm and ${p.T1} K. What volume (L) does it occupy at ${fmt(p.P2, 2)} atm and ${p.T2} K?`,
      given: [
        { label: "State 1", value: `${fmt(p.P1, 2)} atm, ${fmt(p.V1, 1)} L, ${p.T1} K` },
        { label: "State 2", value: `${fmt(p.P2, 2)} atm, ? L, ${p.T2} K` },
      ],
      answer: { kind: "numeric", value: v2, unit: "L", tolerance: sigTolerance(v2, 2) },
      hints: [
        "Use P₁V₁/T₁ = P₂V₂/T₂ (temperatures in kelvin).",
        "Solve for V₂ = P₁V₁T₂ / (T₁P₂).",
      ],
      solution: `V₂ = P₁V₁T₂ / (T₁P₂) = (${fmt(p.P1, 2)}×${fmt(p.V1, 1)}×${p.T2}) / (${p.T1}×${fmt(p.P2, 2)}) = ${fmt(v2, 2)} L`,
      toolHref: "/reactions",
    };
  },
};
