/**
 * Chemical equilibrium (deferred Module 2 · General chemistry).
 *
 * Solubility from Ksp for a salt AₓBᵧ (and the reverse), plus a qualitative
 * Le Chatelier predictor: given a reaction's change in moles of gas and its
 * enthalpy sign, predict which way an applied stress shifts the equilibrium.
 * Pure/self-contained.
 */

/**
 * Molar solubility s of a salt AₓBᵧ ⇌ x·Aⁿ⁺ + y·Bᵐ⁻ from its Ksp.
 * Ksp = (x·s)ˣ·(y·s)ʸ  ⇒  s = (Ksp / (xˣ·yʸ))^(1/(x+y)). NaN if inputs invalid.
 */
export function molarSolubility(ksp: number, x: number, y: number): number {
  if (!(ksp > 0) || x < 1 || y < 1) return NaN;
  return Math.pow(ksp / (Math.pow(x, x) * Math.pow(y, y)), 1 / (x + y));
}

/** Ksp from molar solubility for a salt AₓBᵧ. */
export function kspFromSolubility(s: number, x: number, y: number): number {
  return Math.pow(x * s, x) * Math.pow(y * s, y);
}

export type Stress =
  | "addReactant"
  | "removeReactant"
  | "addProduct"
  | "removeProduct"
  | "increasePressure"
  | "decreasePressure"
  | "increaseTemp"
  | "decreaseTemp"
  | "catalyst";

export type Shift = "left" | "right" | "none";

export interface Equilibrium {
  /** moles of gas on the product side minus the reactant side */
  deltaNgas: number;
  /** true if the forward reaction is exothermic */
  exothermic: boolean;
}

/** Predict the direction an equilibrium shifts under a stress (Le Chatelier). */
export function leChatelier(
  eq: Equilibrium,
  stress: Stress,
): { shift: Shift; reason: string } {
  switch (stress) {
    case "addReactant":
      return { shift: "right", reason: "Adding reactant drives the system toward products." };
    case "removeReactant":
      return { shift: "left", reason: "Removing reactant pulls the system back toward reactants." };
    case "addProduct":
      return { shift: "left", reason: "Adding product drives the system back toward reactants." };
    case "removeProduct":
      return { shift: "right", reason: "Removing product pulls the system toward products." };
    case "increasePressure":
      if (eq.deltaNgas === 0)
        return { shift: "none", reason: "Equal moles of gas on both sides — pressure has no effect." };
      return {
        shift: eq.deltaNgas < 0 ? "right" : "left",
        reason: "Higher pressure favors the side with fewer moles of gas.",
      };
    case "decreasePressure":
      if (eq.deltaNgas === 0)
        return { shift: "none", reason: "Equal moles of gas on both sides — pressure has no effect." };
      return {
        shift: eq.deltaNgas > 0 ? "right" : "left",
        reason: "Lower pressure favors the side with more moles of gas.",
      };
    case "increaseTemp":
      return {
        shift: eq.exothermic ? "left" : "right",
        reason: eq.exothermic
          ? "Heat is a product; adding heat shifts an exothermic reaction toward reactants."
          : "Heat is a reactant; adding heat shifts an endothermic reaction toward products.",
      };
    case "decreaseTemp":
      return {
        shift: eq.exothermic ? "right" : "left",
        reason: eq.exothermic
          ? "Removing heat shifts an exothermic reaction toward products."
          : "Removing heat shifts an endothermic reaction toward reactants.",
      };
    case "catalyst":
      return { shift: "none", reason: "A catalyst speeds both directions equally — the position of equilibrium is unchanged." };
  }
}
