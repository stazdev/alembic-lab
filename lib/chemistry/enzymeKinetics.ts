/**
 * Enzyme kinetics (deferred Module 2 · Biochemistry).
 *
 * Michaelis–Menten  v = Vmax·[S] / (Km + [S])  and the Lineweaver–Burk
 * linearization  1/v = (Km/Vmax)(1/[S]) + 1/Vmax , with a least-squares fit
 * that recovers Vmax and Km from (substrate, rate) data. Pure/self-contained.
 */

/** Michaelis–Menten rate at substrate concentration s. */
export function michaelisMenten(vmax: number, km: number, s: number): number {
  return (vmax * s) / (km + s);
}

/** Fraction of Vmax (v / Vmax) at substrate concentration s. */
export function rateFraction(km: number, s: number): number {
  return s / (km + s);
}

export interface MMPoint {
  s: number;
  v: number;
}

export type LBFit =
  | {
      ok: true;
      vmax: number;
      km: number;
      slope: number; // Km / Vmax
      intercept: number; // 1 / Vmax
      r2: number;
    }
  | { ok: false; error: string };

/**
 * Lineweaver–Burk fit: linear regression of 1/v on 1/s recovers Vmax (from the
 * y-intercept) and Km (from the slope).
 */
export function lineweaverBurkFit(points: MMPoint[]): LBFit {
  const pts = points.filter((p) => p.s > 0 && p.v > 0);
  if (pts.length < 2)
    return { ok: false, error: "Need at least two positive (s, v) points." };

  const xs = pts.map((p) => 1 / p.s);
  const ys = pts.map((p) => 1 / p.v);
  const n = pts.length;
  const sx = xs.reduce((a, b) => a + b, 0);
  const sy = ys.reduce((a, b) => a + b, 0);
  const sxx = xs.reduce((a, x) => a + x * x, 0);
  const sxy = xs.reduce((a, x, i) => a + x * ys[i], 0);

  const denom = n * sxx - sx * sx;
  if (denom === 0)
    return { ok: false, error: "Substrate values must vary." };

  const slope = (n * sxy - sx * sy) / denom; // Km / Vmax
  const intercept = (sy - slope * sx) / n; // 1 / Vmax
  if (intercept <= 0 || slope <= 0)
    return { ok: false, error: "Data does not fit a saturating curve." };

  const vmax = 1 / intercept;
  const km = slope * vmax;

  const yMean = sy / n;
  let ssRes = 0;
  let ssTot = 0;
  for (let i = 0; i < n; i++) {
    const yhat = slope * xs[i] + intercept;
    ssRes += (ys[i] - yhat) ** 2;
    ssTot += (ys[i] - yMean) ** 2;
  }
  const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot;

  return { ok: true, vmax, km, slope, intercept, r2 };
}
