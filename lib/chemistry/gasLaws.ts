/**
 * Gas laws (deferred Module 2 · General chemistry).
 *
 * Ideal gas law PV = nRT and the combined gas law P₁V₁/T₁ = P₂V₂/T₂. Each
 * solver takes a partial set of variables, requires exactly one unknown, and
 * returns it. Pure and self-contained (Vitest-/Node-testable).
 *
 * Units: P in atm, V in L, n in mol, T in K (so R is in L·atm·mol⁻¹·K⁻¹).
 */
export const R_L_ATM = 0.0820573; // L·atm·mol⁻¹·K⁻¹

export interface GasState {
  P: number;
  V: number;
  n: number;
  T: number;
}
export type GasVar = keyof GasState;

export interface CombinedState {
  P1: number;
  V1: number;
  T1: number;
  P2: number;
  V2: number;
  T2: number;
}
export type CombinedVar = keyof CombinedState;

export type Solved<T> =
  | { ok: true; value: number; solvedFor: keyof T; all: T }
  | { ok: false; error: string };

function allPositive(known: Record<string, number | undefined>): boolean {
  return Object.values(known).every(
    (v) => v == null || (Number.isFinite(v) && v > 0),
  );
}

/** Solve PV = nRT for the single missing variable among P, V, n, T. */
export function solveIdeal(known: Partial<GasState>): Solved<GasState> {
  const keys: GasVar[] = ["P", "V", "n", "T"];
  const missing = keys.filter((k) => known[k] == null);
  if (missing.length !== 1)
    return { ok: false, error: "Enter exactly three of P, V, n, T." };
  if (!allPositive(known))
    return { ok: false, error: "All values must be positive numbers." };

  const { P, V, n, T } = known;
  const solvedFor = missing[0];
  let value: number;
  switch (solvedFor) {
    case "P":
      value = (n! * R_L_ATM * T!) / V!;
      break;
    case "V":
      value = (n! * R_L_ATM * T!) / P!;
      break;
    case "n":
      value = (P! * V!) / (R_L_ATM * T!);
      break;
    default:
      value = (P! * V!) / (n! * R_L_ATM); // T
  }

  const all: GasState = {
    P: P ?? value,
    V: V ?? value,
    n: n ?? value,
    T: T ?? value,
  };
  return { ok: true, value, solvedFor, all };
}

/** Solve P₁V₁/T₁ = P₂V₂/T₂ for the single missing variable of the six. */
export function solveCombined(
  known: Partial<CombinedState>,
): Solved<CombinedState> {
  const keys: CombinedVar[] = ["P1", "V1", "T1", "P2", "V2", "T2"];
  const missing = keys.filter((k) => known[k] == null);
  if (missing.length !== 1)
    return { ok: false, error: "Enter exactly five of the six values." };
  if (!allPositive(known))
    return { ok: false, error: "All values must be positive numbers." };

  const { P1, V1, T1, P2, V2, T2 } = known;
  const solvedFor = missing[0];
  let value: number;
  switch (solvedFor) {
    case "P1":
      value = (P2! * V2! * T1!) / (T2! * V1!);
      break;
    case "V1":
      value = (P2! * V2! * T1!) / (T2! * P1!);
      break;
    case "T1":
      value = (P1! * V1! * T2!) / (P2! * V2!);
      break;
    case "P2":
      value = (P1! * V1! * T2!) / (T1! * V2!);
      break;
    case "V2":
      value = (P1! * V1! * T2!) / (T1! * P2!);
      break;
    default:
      value = (P2! * V2! * T1!) / (P1! * V1!); // T2
  }

  const all: CombinedState = {
    P1: P1 ?? value,
    V1: V1 ?? value,
    T1: T1 ?? value,
    P2: P2 ?? value,
    V2: V2 ?? value,
    T2: T2 ?? value,
  };
  return { ok: true, value, solvedFor, all };
}
