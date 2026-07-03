/**
 * Chemical kinetics engine (Module 2 · §2.1).
 *
 * Pure and self-contained. Rate laws, integrated rate laws for 0/1/2 order,
 * half-lives, and the Arrhenius relation. Ea is taken in kJ/mol throughout.
 */

export const R = 8.314; // J/(mol·K)

export type Order = 0 | 1 | 2;

export interface RateTerm {
  conc: number;
  order: number;
}

/** rate = k · Π [X]^order. */
export function rate(k: number, terms: RateTerm[]): number {
  return terms.reduce((acc, t) => acc * Math.pow(t.conc, t.order), k);
}

/** [A] at time t for a single-reactant reaction of the given order. */
export function concentrationAtTime(
  a0: number,
  k: number,
  order: Order,
  t: number,
): number {
  if (order === 0) return Math.max(0, a0 - k * t);
  if (order === 1) return a0 * Math.exp(-k * t);
  return a0 / (1 + a0 * k * t); // second order
}

export function halfLife(a0: number, k: number, order: Order): number {
  if (order === 0) return a0 / (2 * k);
  if (order === 1) return Math.LN2 / k;
  return 1 / (k * a0);
}

export interface DecayPoint {
  t: number;
  conc: number;
}

export function decayCurve(
  a0: number,
  k: number,
  order: Order,
  tmax: number,
  n = 120,
): DecayPoint[] {
  const points: DecayPoint[] = [];
  for (let i = 0; i <= n; i++) {
    const t = (tmax * i) / n;
    points.push({ t, conc: concentrationAtTime(a0, k, order, t) });
  }
  return points;
}

/** The integrated rate law and its linear form, per order. */
export function integratedLaw(order: Order): { law: string; linear: string } {
  if (order === 0) return { law: "[A] = [A]₀ − kt", linear: "[A] vs t" };
  if (order === 1) return { law: "[A] = [A]₀·e^(−kt)", linear: "ln[A] vs t" };
  return { law: "1/[A] = 1/[A]₀ + kt", linear: "1/[A] vs t" };
}

/** SI-ish units of k for each order (concentration in M, time in s). */
export function rateConstantUnit(order: Order): string {
  if (order === 0) return "M·s⁻¹";
  if (order === 1) return "s⁻¹";
  return "M⁻¹·s⁻¹";
}

/** Arrhenius k = A·exp(−Ea/RT); Ea in kJ/mol, T in K. */
export function arrheniusK(preExp: number, eaKJ: number, T: number): number {
  return preExp * Math.exp(-(eaKJ * 1000) / (R * T));
}

/** Activation energy (kJ/mol) from two (k, T) points. */
export function activationEnergy(
  k1: number,
  T1: number,
  k2: number,
  T2: number,
): number {
  const ea = (-R * Math.log(k2 / k1)) / (1 / T2 - 1 / T1); // J/mol
  return ea / 1000;
}
