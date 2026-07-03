/**
 * pH & titration engine (Module 2 · §2.1).
 *
 * Pure and self-contained (no imports) so it can be unit-tested directly.
 * Point calculations use closed-form ICE-table results; titration curves use a
 * charge-balance equation solved by bisection, which stays correct and smooth
 * through every region (initial, buffer, equivalence, and excess titrant).
 */

const KW = 1e-14; // water autoionization at 25 °C
const STRONG = 1e9; // Ka/Kb for a strong acid/base ≈ fully dissociated

export const pKaToKa = (pKa: number): number => Math.pow(10, -pKa);
export const kaTopKa = (ka: number): number => -Math.log10(ka);

// ── point pH (single solution) ────────────────────────────────
export function strongAcidPH(c: number): number {
  const h = (c + Math.sqrt(c * c + 4 * KW)) / 2;
  return -Math.log10(h);
}

export function strongBasePH(c: number): number {
  const oh = (c + Math.sqrt(c * c + 4 * KW)) / 2;
  return 14 + Math.log10(oh);
}

/** Weak acid via the full quadratic Ka = x²/(C−x). */
export function weakAcidPH(c: number, ka: number): number {
  const h = (-ka + Math.sqrt(ka * ka + 4 * ka * c)) / 2;
  return -Math.log10(h);
}

export function weakBasePH(c: number, kb: number): number {
  const oh = (-kb + Math.sqrt(kb * kb + 4 * kb * c)) / 2;
  return 14 + Math.log10(oh);
}

/** Henderson–Hasselbalch buffer. */
export function bufferPH(pKa: number, amountHA: number, amountA: number): number {
  return pKa + Math.log10(amountA / amountHA);
}

// ── titration curves ──────────────────────────────────────────
export interface TitrationPoint {
  volume: number; // mL of titrant added
  ph: number;
}

export interface TitrationCurve {
  points: TitrationPoint[];
  equivalenceVolume: number; // mL
  equivalencePH: number;
  halfEquivalencePH: number; // = pKa (weak acid) / 14 − pKb (weak base)
  maxVolume: number;
}

/** Bisection for a residual that is monotonically decreasing in pH. */
function solvePH(residual: (ph: number) => number): number {
  let lo = -2;
  let hi = 16;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (residual(mid) > 0) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

interface TitrationInput {
  analyteConc: number; // mol/L
  analyteVol: number; // mL
  /** pKa (acid) or pKb (base); null ⇒ strong. */
  pK: number | null;
  titrantConc: number; // mol/L
  maxVolumeFactor?: number;
  points?: number;
}

/** Acid analyte titrated with a strong base. */
export function titrateAcidWithBase(input: TitrationInput): TitrationCurve {
  const ka = input.pK == null ? STRONG : pKaToKa(input.pK);
  const molesAcid = input.analyteConc * (input.analyteVol / 1000);
  const veq = (molesAcid / input.titrantConc) * 1000; // mL
  const vmax = veq * (input.maxVolumeFactor ?? 2);
  const n = input.points ?? 140;

  const phAt = (vb: number) => {
    const vtot = (input.analyteVol + vb) / 1000; // L
    const ct = molesAcid / vtot;
    const cb = (input.titrantConc * (vb / 1000)) / vtot;
    return solvePH((ph) => {
      const h = Math.pow(10, -ph);
      return cb + h - (ct * ka) / (ka + h) - KW / h;
    });
  };

  const points: TitrationPoint[] = [];
  for (let i = 0; i <= n; i++) {
    const vb = (vmax * i) / n;
    points.push({ volume: vb, ph: phAt(vb) });
  }

  return {
    points,
    equivalenceVolume: veq,
    equivalencePH: phAt(veq),
    halfEquivalencePH: phAt(veq / 2),
    maxVolume: vmax,
  };
}

/** Base analyte titrated with a strong acid. */
export function titrateBaseWithAcid(input: TitrationInput): TitrationCurve {
  const kb = input.pK == null ? STRONG : pKaToKa(input.pK); // pKb here
  const kaConj = KW / kb;
  const molesBase = input.analyteConc * (input.analyteVol / 1000);
  const veq = (molesBase / input.titrantConc) * 1000;
  const vmax = veq * (input.maxVolumeFactor ?? 2);
  const n = input.points ?? 140;

  const phAt = (va: number) => {
    const vtot = (input.analyteVol + va) / 1000;
    const ct = molesBase / vtot;
    const cs = (input.titrantConc * (va / 1000)) / vtot;
    return solvePH((ph) => {
      const h = Math.pow(10, -ph);
      return (ct * h) / (kaConj + h) + h - KW / h - cs;
    });
  };

  const points: TitrationPoint[] = [];
  for (let i = 0; i <= n; i++) {
    const va = (vmax * i) / n;
    points.push({ volume: va, ph: phAt(va) });
  }

  return {
    points,
    equivalenceVolume: veq,
    equivalencePH: phAt(veq),
    halfEquivalencePH: phAt(veq / 2),
    maxVolume: vmax,
  };
}
