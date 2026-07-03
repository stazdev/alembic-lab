/**
 * Electrochemistry (deferred Module 2 · Physical chemistry).
 *
 * Standard cell potential E°cell = E°(cathode) − E°(anode); the Nernst equation
 * E = E° − (RT/nF)·ln Q; ΔG = −nFE; and K from E° via ln K = nFE°/RT. Potentials
 * are intensive (independent of n); ΔG and K use n = electrons in the balanced
 * cell reaction. Pure/self-contained.
 */
export const F = 96485; // Faraday constant, C/mol
export const R = 8.314; // J/(mol·K)

/** E°cell = E°(cathode, reduction) − E°(anode, reduction). >0 ⇒ spontaneous. */
export function standardCellPotential(cathodeE0: number, anodeE0: number): number {
  return cathodeE0 - anodeE0;
}

/** Nernst equation: E = E° − (RT/nF)·ln Q. */
export function nernst(E0: number, n: number, Q: number, T = 298.15): number {
  return E0 - ((R * T) / (n * F)) * Math.log(Q);
}

/** Gibbs free energy of the cell reaction, ΔG = −nFE, returned in kJ/mol. */
export function cellGibbs(n: number, Ecell: number): number {
  return (-n * F * Ecell) / 1000;
}

/** Equilibrium constant from the standard cell potential: ln K = nFE°/RT. */
export function cellEquilibriumK(E0: number, n: number, T = 298.15): number {
  return Math.exp((n * F * E0) / (R * T));
}

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

/** Electrons in the balanced cell reaction = LCM of the two half-reaction counts. */
export function lcm(a: number, b: number): number {
  return (a * b) / gcd(a, b);
}
