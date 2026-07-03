/**
 * Stoichiometry & solutions engine (Module 2 · §2.1).
 *
 * Pure, deterministic, framework-free. Molar mass comes from the shared atomic
 * weight table; everything else (moles ⇄ mass ⇄ molarity, dilution, limiting
 * reagent + yield) is basic mole bookkeeping on top of it.
 */
import { parseFormula } from "./balancer";
import { ATOMIC_MASS } from "@/data/atomicMasses";

export type Result<T> = { ok: true; value: T } | { ok: false; error: string };

// ── molar mass ────────────────────────────────────────────────
export interface MolarMassPart {
  element: string;
  count: number;
  atomicMass: number;
  subtotal: number;
}

export interface MolarMassResult {
  formula: string;
  molarMass: number;
  parts: MolarMassPart[];
}

export function molarMass(formula: string): Result<MolarMassResult> {
  const parsed = parseFormula(formula);
  if (parsed.error) return { ok: false, error: parsed.error };

  const parts: MolarMassPart[] = [];
  let total = 0;
  for (const element of Object.keys(parsed.counts)) {
    const am = ATOMIC_MASS[element];
    if (am == null) return { ok: false, error: `Unknown element “${element}”` };
    const count = parsed.counts[element];
    const subtotal = am * count;
    total += subtotal;
    parts.push({ element, count, atomicMass: am, subtotal });
  }
  parts.sort((a, b) => b.subtotal - a.subtotal);
  return { ok: true, value: { formula, molarMass: total, parts } };
}

// ── solution relationships ────────────────────────────────────
export const molesFromMass = (mass: number, mm: number): number => mass / mm;
export const massFromMoles = (moles: number, mm: number): number => moles * mm;
export const molarity = (moles: number, volumeL: number): number =>
  moles / volumeL;

// ── dilution: C1·V1 = C2·V2 ───────────────────────────────────
export type DilutionKey = "c1" | "v1" | "c2" | "v2";

export interface DilutionResult {
  c1: number;
  v1: number;
  c2: number;
  v2: number;
  solved: DilutionKey;
}

/** Solve C1·V1 = C2·V2 for the single missing value (pass null for it). */
export function solveDilution(
  c1: number | null,
  v1: number | null,
  c2: number | null,
  v2: number | null,
): Result<DilutionResult> {
  const missing = [c1, v1, c2, v2].filter((x) => x == null).length;
  if (missing !== 1)
    return { ok: false, error: "Enter exactly three values and leave one blank." };

  let solved: DilutionKey;
  if (c1 == null) {
    if (v1 === 0) return { ok: false, error: "V₁ can't be zero." };
    c1 = (c2! * v2!) / v1!;
    solved = "c1";
  } else if (v1 == null) {
    if (c1 === 0) return { ok: false, error: "C₁ can't be zero." };
    v1 = (c2! * v2!) / c1;
    solved = "v1";
  } else if (c2 == null) {
    if (v2 === 0) return { ok: false, error: "V₂ can't be zero." };
    c2 = (c1 * v1) / v2!;
    solved = "c2";
  } else {
    if (c2 === 0) return { ok: false, error: "C₂ can't be zero." };
    v2 = (c1 * v1) / c2;
    solved = "v2";
  }
  return { ok: true, value: { c1: c1!, v1: v1!, c2: c2!, v2: v2!, solved } };
}

// ── limiting reagent & yield ──────────────────────────────────
export interface ReactantInput {
  formula: string;
  coeff: number;
  grams: number;
}

export interface ProductInput {
  formula: string;
  coeff: number;
}

export interface ReactantResult {
  formula: string;
  coeff: number;
  grams: number;
  molarMass: number;
  moles: number;
  ratio: number; // moles / coeff
  limiting: boolean;
  molesRemaining: number; // 0 for the limiting reagent
  gramsRemaining: number;
}

export interface ProductResult {
  formula: string;
  coeff: number;
  molarMass: number;
  moles: number;
  grams: number;
}

export interface LimitingResult {
  reactants: ReactantResult[];
  products: ProductResult[];
  limiting: string;
  extent: number; // moles of reaction (min ratio)
}

export function solveLimiting(
  reactants: ReactantInput[],
  products: ProductInput[],
): Result<LimitingResult> {
  if (reactants.length === 0)
    return { ok: false, error: "Add at least one reactant." };

  const withMoles = reactants.map((r) => {
    const mm = molarMass(r.formula);
    return { input: r, mm };
  });
  for (const w of withMoles) {
    if (!w.mm.ok) return { ok: false, error: `“${w.input.formula}”: ${w.mm.error}` };
    if (w.input.coeff <= 0)
      return { ok: false, error: `“${w.input.formula}”: coefficient must be ≥ 1.` };
  }

  const rows = withMoles.map((w) => {
    const mm = (w.mm as { ok: true; value: MolarMassResult }).value.molarMass;
    const moles = w.input.grams / mm;
    return {
      formula: w.input.formula,
      coeff: w.input.coeff,
      grams: w.input.grams,
      molarMass: mm,
      moles,
      ratio: moles / w.input.coeff,
    };
  });

  const extent = Math.min(...rows.map((r) => r.ratio));
  const limitingRow = rows.reduce((a, b) => (a.ratio <= b.ratio ? a : b));

  const reactantResults: ReactantResult[] = rows.map((r) => {
    const consumed = extent * r.coeff;
    const molesRemaining = Math.max(0, r.moles - consumed);
    return {
      ...r,
      limiting: r.formula === limitingRow.formula,
      molesRemaining,
      gramsRemaining: molesRemaining * r.molarMass,
    };
  });

  const productResults: ProductResult[] = [];
  for (const p of products) {
    const mm = molarMass(p.formula);
    if (!mm.ok) return { ok: false, error: `“${p.formula}”: ${mm.error}` };
    if (p.coeff <= 0)
      return { ok: false, error: `“${p.formula}”: coefficient must be ≥ 1.` };
    const moles = extent * p.coeff;
    productResults.push({
      formula: p.formula,
      coeff: p.coeff,
      molarMass: mm.value.molarMass,
      moles,
      grams: moles * mm.value.molarMass,
    });
  }

  return {
    ok: true,
    value: {
      reactants: reactantResults,
      products: productResults,
      limiting: limitingRow.formula,
      extent,
    },
  };
}
