/**
 * Thermodynamics engine (Module 2 · §2.1).
 *
 * Pure and self-contained. Reaction quantities use Hess's law over standard
 * formation data; Gibbs, the equilibrium constant, and calorimetry are the
 * standard relations. Units: ΔH in kJ/mol, ΔS in J/(mol·K), T in K.
 */

export const R = 8.314; // J/(mol·K)
export const STANDARD_T = 298.15; // K

export interface ThermoTerm {
  dHf: number; // kJ/mol
  s: number; // J/(mol·K)
  coeff: number;
}

export interface ReactionThermo {
  dH: number; // kJ/mol
  dS: number; // J/(mol·K)
  dG: number; // kJ/mol at T
  spontaneous: boolean;
  K: number;
  temperatureK: number;
  /** T at which ΔG = 0 (only meaningful when ΔH and ΔS share a sign). */
  crossoverT: number | null;
}

const sumH = (terms: ThermoTerm[]) =>
  terms.reduce((acc, t) => acc + t.coeff * t.dHf, 0);
const sumS = (terms: ThermoTerm[]) =>
  terms.reduce((acc, t) => acc + t.coeff * t.s, 0);

/** ΔH°rxn, ΔS°rxn, ΔG (at T), spontaneity, and K from standard data. */
export function reactionThermo(
  reactants: ThermoTerm[],
  products: ThermoTerm[],
  temperatureK: number = STANDARD_T,
): ReactionThermo {
  const dH = sumH(products) - sumH(reactants); // kJ/mol
  const dS = sumS(products) - sumS(reactants); // J/(mol·K)
  const dG = dH - temperatureK * (dS / 1000); // kJ/mol
  const K = Math.exp(-(dG * 1000) / (R * temperatureK));
  const crossoverT =
    dS !== 0 && dH / dS > 0 ? (dH * 1000) / dS : null;
  return {
    dH,
    dS,
    dG,
    spontaneous: dG < 0,
    K,
    temperatureK,
    crossoverT,
  };
}

/** ΔG = ΔH − TΔS (ΔH in kJ/mol, ΔS in J/(mol·K)). */
export function gibbs(dHkJ: number, dSJ: number, temperatureK: number): number {
  return dHkJ - temperatureK * (dSJ / 1000);
}

/** Equilibrium constant from ΔG° (kJ/mol). */
export function kFromDG(dGkJ: number, temperatureK: number): number {
  return Math.exp(-(dGkJ * 1000) / (R * temperatureK));
}

/** ΔG° (kJ/mol) from an equilibrium constant. */
export function dGFromK(K: number, temperatureK: number): number {
  return -(R * temperatureK * Math.log(K)) / 1000;
}

/** Calorimetry: q = m·c·ΔT (grams, J/(g·K), K) → joules. */
export function heat(massG: number, specificHeat: number, dT: number): number {
  return massG * specificHeat * dT;
}
