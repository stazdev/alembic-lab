/**
 * Ground-state electron configuration (Module 3 · §3.1).
 *
 * Subshells fill in Madelung (Aufbau) order, which is exact for ~98 elements.
 * The ~20 well-known anomalies (Cr, Cu, the 4d row, Pd, La/Ce/Gd, Pt/Au, and the
 * early actinides) are overridden with their real configurations so that BOTH
 * the shell diagram and the notation match textbooks — no mixed sources.
 *
 * Pure and self-contained (no imports) so it is Node-/Vitest-testable.
 */

const L_LABEL = ["s", "p", "d", "f"] as const;
const L_CAP = [2, 6, 10, 14];

// Madelung filling order as (n, l) pairs.
const ORDER: ReadonlyArray<readonly [number, number]> = [
  [1, 0],
  [2, 0], [2, 1],
  [3, 0], [3, 1],
  [4, 0], [3, 2], [4, 1],
  [5, 0], [4, 2], [5, 1],
  [6, 0], [4, 3], [5, 2], [6, 1],
  [7, 0], [5, 3], [6, 2], [7, 1],
];

const NOBLE_Z: Record<string, number> = {
  He: 2,
  Ne: 10,
  Ar: 18,
  Kr: 36,
  Xe: 54,
  Rn: 86,
};

// z -> real configuration (noble-gas shorthand) for elements that break Aufbau.
const ANOMALIES: Record<number, string> = {
  24: "[Ar] 3d5 4s1", // Cr
  29: "[Ar] 3d10 4s1", // Cu
  41: "[Kr] 4d4 5s1", // Nb
  42: "[Kr] 4d5 5s1", // Mo
  44: "[Kr] 4d7 5s1", // Ru
  45: "[Kr] 4d8 5s1", // Rh
  46: "[Kr] 4d10", // Pd
  47: "[Kr] 4d10 5s1", // Ag
  57: "[Xe] 5d1 6s2", // La
  58: "[Xe] 4f1 5d1 6s2", // Ce
  64: "[Xe] 4f7 5d1 6s2", // Gd
  78: "[Xe] 4f14 5d9 6s1", // Pt
  79: "[Xe] 4f14 5d10 6s1", // Au
  89: "[Rn] 6d1 7s2", // Ac
  90: "[Rn] 6d2 7s2", // Th
  91: "[Rn] 5f2 6d1 7s2", // Pa
  92: "[Rn] 5f3 6d1 7s2", // U
  93: "[Rn] 5f4 6d1 7s2", // Np
  96: "[Rn] 5f7 6d1 7s2", // Cm
  103: "[Rn] 5f14 7s2 7p1", // Lr
};

export interface Subshell {
  n: number;
  l: number; // 0=s, 1=p, 2=d, 3=f
  e: number;
}

export interface ElectronConfig {
  occupancy: Subshell[]; // sorted by (n, l)
  shells: number[]; // electrons per principal shell, index 0 => n=1
  valence: number; // electrons in the highest occupied shell
  notation: string; // full, e.g. "1s² 2s² 2p⁶ …"
  noble: string; // noble-gas shorthand, e.g. "[Ne] 3s² 3p⁴"
}

function aufbauOccupancy(z: number): Subshell[] {
  let remaining = z;
  const occ: Subshell[] = [];
  for (const [n, l] of ORDER) {
    if (remaining <= 0) break;
    const e = Math.min(L_CAP[l], remaining);
    occ.push({ n, l, e });
    remaining -= e;
  }
  return occ;
}

const SUB_RE = /(\d)([spdf])(\d+)/g;

function parseSpec(spec: string): Subshell[] {
  const occ: Subshell[] = [];
  const noble = spec.match(/^\[([A-Za-z]+)\]/);
  if (noble) occ.push(...aufbauOccupancy(NOBLE_Z[noble[1]]));
  let m: RegExpExecArray | null;
  SUB_RE.lastIndex = 0;
  while ((m = SUB_RE.exec(spec)) !== null) {
    occ.push({
      n: Number(m[1]),
      l: L_LABEL.indexOf(m[2] as (typeof L_LABEL)[number]),
      e: Number(m[3]),
    });
  }
  return occ;
}

const SUP: Record<string, string> = {
  "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
  "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹",
};
const sup = (n: number): string =>
  String(n)
    .split("")
    .map((d) => SUP[d])
    .join("");

const fmt = (s: Subshell): string => `${s.n}${L_LABEL[s.l]}${sup(s.e)}`;

export function electronConfiguration(z: number): ElectronConfig {
  const raw = ANOMALIES[z] ? parseSpec(ANOMALIES[z]) : aufbauOccupancy(z);
  const occupancy = [...raw].sort((a, b) => a.n - b.n || a.l - b.l);

  const shells: number[] = [];
  for (const s of occupancy) shells[s.n - 1] = (shells[s.n - 1] ?? 0) + s.e;
  const filled = Array.from({ length: shells.length }, (_, i) => shells[i] ?? 0);

  const notation = occupancy.map(fmt).join(" ");

  // Noble-gas shorthand: the largest noble gas lighter than this element.
  let noble = notation;
  const core = Object.entries(NOBLE_Z)
    .filter(([, cz]) => cz < z)
    .sort((a, b) => b[1] - a[1])[0];
  if (core) {
    const [sym, cz] = core;
    const coreKeys = new Set(aufbauOccupancy(cz).map((s) => `${s.n}.${s.l}`));
    const outer = occupancy.filter((s) => !coreKeys.has(`${s.n}.${s.l}`));
    noble = `[${sym}] ${outer.map(fmt).join(" ")}`;
  }

  return {
    occupancy,
    shells: filled,
    valence: filled[filled.length - 1] ?? 0,
    notation,
    noble,
  };
}
