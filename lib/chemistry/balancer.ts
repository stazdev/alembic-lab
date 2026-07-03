/**
 * Chemical equation balancer (Module 2 · §2.2).
 *
 * Pure, deterministic, and framework-free. Balancing is solved as a
 * linear-algebra null-space problem over the rationals (exact fractions, no
 * floating-point drift): build a matrix of element counts (reactants +,
 * products −), reduce to RREF, and read off the integer coefficient vector.
 */

export interface ParsedFormula {
  counts: Record<string, number>;
  error?: string;
}

/** Parse a formula like "Ca(OH)2" or "Fe2(SO4)3" into element counts. */
export function parseFormula(formula: string): ParsedFormula {
  const f = formula.trim();
  if (!f) return { counts: {}, error: "Empty formula" };

  let i = 0;
  let error: string | undefined;

  function readNumber(): number {
    let num = "";
    while (i < f.length && f[i] >= "0" && f[i] <= "9") {
      num += f[i];
      i++;
    }
    return num === "" ? 1 : parseInt(num, 10);
  }

  function parseGroup(depth: number): Record<string, number> {
    const counts: Record<string, number> = {};
    while (i < f.length) {
      const c = f[i];
      if (c === "(" || c === "[") {
        i++;
        const inner = parseGroup(depth + 1);
        const mult = readNumber();
        for (const el in inner) counts[el] = (counts[el] ?? 0) + inner[el] * mult;
      } else if (c === ")" || c === "]") {
        if (depth === 0) error = "Unmatched closing bracket";
        i++;
        return counts;
      } else if (c >= "A" && c <= "Z") {
        let sym = c;
        i++;
        while (i < f.length && f[i] >= "a" && f[i] <= "z") {
          sym += f[i];
          i++;
        }
        counts[sym] = (counts[sym] ?? 0) + readNumber();
      } else if (c === " " || c === "\t") {
        i++;
      } else {
        error = `Unexpected character “${c}”`;
        i++;
      }
    }
    if (depth !== 0) error = "Unclosed bracket";
    return counts;
  }

  const counts = parseGroup(0);
  if (error) return { counts, error };
  if (Object.keys(counts).length === 0)
    return { counts, error: "No elements found" };
  return { counts };
}

// ── exact rational arithmetic ─────────────────────────────────
interface Frac {
  n: number;
  d: number;
}

function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
}

function frac(n: number, d = 1): Frac {
  if (d === 0) return { n: 0, d: 1 };
  if (d < 0) {
    n = -n;
    d = -d;
  }
  const g = gcd(n, d) || 1;
  return { n: n / g, d: d / g };
}

const fmul = (a: Frac, b: Frac): Frac => frac(a.n * b.n, a.d * b.d);
const fdiv = (a: Frac, b: Frac): Frac => frac(a.n * b.d, a.d * b.n);
const fsub = (a: Frac, b: Frac): Frac => frac(a.n * b.d - b.n * a.d, a.d * b.d);
const fzero = (a: Frac): boolean => a.n === 0;

function rref(M: Frac[][]): void {
  const rows = M.length;
  const cols = M[0]?.length ?? 0;
  let lead = 0;
  for (let r = 0; r < rows; r++) {
    if (lead >= cols) return;
    let i = r;
    while (fzero(M[i][lead])) {
      i++;
      if (i === rows) {
        i = r;
        lead++;
        if (lead === cols) return;
      }
    }
    [M[i], M[r]] = [M[r], M[i]];
    const lv = M[r][lead];
    M[r] = M[r].map((x) => fdiv(x, lv));
    for (let j = 0; j < rows; j++) {
      if (j !== r && !fzero(M[j][lead])) {
        const factor = M[j][lead];
        M[j] = M[j].map((x, k) => fsub(x, fmul(factor, M[r][k])));
      }
    }
    lead++;
  }
}

/** Find the 1-dimensional null space as the smallest positive integer vector. */
function solveNullSpace(matrix: Frac[][], cols: number): number[] | null {
  if (matrix.length === 0 || cols === 0) return null;
  const M = matrix.map((row) => row.slice());
  rref(M);

  const isPivot = new Array<boolean>(cols).fill(false);
  const pivotRowForCol: Record<number, number> = {};
  for (let r = 0; r < M.length; r++) {
    let lead = -1;
    for (let c = 0; c < cols; c++) {
      if (!fzero(M[r][c])) {
        lead = c;
        break;
      }
    }
    if (lead >= 0) {
      isPivot[lead] = true;
      pivotRowForCol[lead] = r;
    }
  }

  const freeCols: number[] = [];
  for (let c = 0; c < cols; c++) if (!isPivot[c]) freeCols.push(c);
  if (freeCols.length !== 1) return null; // 0 → over-determined, >1 → ambiguous
  const free = freeCols[0];

  const x: Frac[] = Array.from({ length: cols }, () => frac(0));
  x[free] = frac(1);
  for (let c = 0; c < cols; c++) {
    if (isPivot[c]) {
      const r = pivotRowForCol[c];
      x[c] = fmul(frac(-1), fmul(M[r][free], x[free]));
    }
  }

  // Clear denominators, then normalise sign and reduce.
  let lcm = 1;
  for (const f of x) lcm = (lcm / gcd(lcm, f.d)) * f.d;
  let ints = x.map((f) => Math.round((f.n * lcm) / f.d));
  if (ints.every((v) => v <= 0)) ints = ints.map((v) => -v);
  if (ints.some((v) => v <= 0)) return null; // mixed signs → not a valid balance
  let g = 0;
  for (const v of ints) g = gcd(g, v);
  if (g > 1) ints = ints.map((v) => v / g);
  return ints;
}

export type BalanceResult =
  | { ok: true; coefficients: number[] }
  | { ok: false; error: string };

/** Balance an equation. Returns coefficients in [reactants…, products…] order. */
export function balanceEquation(
  reactants: string[],
  products: string[],
): BalanceResult {
  if (reactants.length === 0 || products.length === 0)
    return { ok: false, error: "Need at least one reactant and one product." };

  const species = [...reactants, ...products];
  const parsed = species.map(parseFormula);
  for (let s = 0; s < parsed.length; s++) {
    if (parsed[s].error)
      return { ok: false, error: `“${species[s]}”: ${parsed[s].error}` };
  }

  const elements = Array.from(
    new Set(parsed.flatMap((p) => Object.keys(p.counts))),
  );
  const nR = reactants.length;
  const matrix: Frac[][] = elements.map((el) =>
    parsed.map((p, idx) => {
      const v = p.counts[el] ?? 0;
      return frac(idx < nR ? v : -v);
    }),
  );

  const coefficients = solveNullSpace(matrix, species.length);
  if (!coefficients)
    return {
      ok: false,
      error: "This equation can’t be balanced — check the formulas and sides.",
    };
  return { ok: true, coefficients };
}

// ── live validation for the interactive workspace ─────────────
export interface ElementBalance {
  element: string;
  left: number;
  right: number;
  balanced: boolean;
}

export interface BalanceCheck {
  elements: ElementBalance[];
  balanced: boolean;
}

export interface Species {
  formula: string;
  coeff: number;
}

function tally(list: Species[]): Record<string, number> {
  const t: Record<string, number> = {};
  for (const { formula, coeff } of list) {
    const { counts, error } = parseFormula(formula);
    if (error) continue;
    for (const el in counts) t[el] = (t[el] ?? 0) + counts[el] * coeff;
  }
  return t;
}

/** Compare element tallies on both sides for the live ledger. */
export function checkBalance(
  reactants: Species[],
  products: Species[],
): BalanceCheck {
  const left = tally(reactants);
  const right = tally(products);
  const elements = Array.from(
    new Set([...Object.keys(left), ...Object.keys(right)]),
  ).sort();

  const rows: ElementBalance[] = elements.map((el) => ({
    element: el,
    left: left[el] ?? 0,
    right: right[el] ?? 0,
    balanced: (left[el] ?? 0) === (right[el] ?? 0),
  }));

  const allSpecies = [...reactants, ...products];
  const positiveCoeffs = allSpecies.every((s) => s.coeff > 0);
  return {
    elements: rows,
    balanced: rows.length > 0 && positiveCoeffs && rows.every((r) => r.balanced),
  };
}
