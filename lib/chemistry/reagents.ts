/**
 * Reagents the student can add to a vessel (§1.2).
 *
 * A deliberately small, curated set chosen so the sandbox can show every kind
 * of visible outcome — colour, precipitate, gas, indicator, heat. Pure data;
 * the appearance/reaction logic lives in resolve.ts.
 */

export type ReagentRole = "acid" | "base" | "indicator" | "salt" | "solvent";

export interface Reagent {
  id: string;
  name: string;
  formula: string;
  /** Display colour of the solution (hex). Colourless reagents share a pale tint. */
  color: string;
  colorless: boolean;
  role: ReagentRole;
  concentrationM?: number;
  /** mL added per click from the shelf. */
  aliquotMl: number;
  hazard?: string;
}

/** Pale water-like tint used for all colourless aqueous reagents. */
export const COLORLESS_TINT = "#dcebf4";

export const REAGENTS: Reagent[] = [
  {
    id: "water",
    name: "Distilled Water",
    formula: "H₂O",
    color: COLORLESS_TINT,
    colorless: true,
    role: "solvent",
    aliquotMl: 40,
  },
  {
    id: "hcl",
    name: "Hydrochloric Acid",
    formula: "HCl",
    color: COLORLESS_TINT,
    colorless: true,
    role: "acid",
    concentrationM: 0.1,
    aliquotMl: 25,
    hazard: "Corrosive",
  },
  {
    id: "naoh",
    name: "Sodium Hydroxide",
    formula: "NaOH",
    color: COLORLESS_TINT,
    colorless: true,
    role: "base",
    concentrationM: 0.1,
    aliquotMl: 25,
    hazard: "Corrosive",
  },
  {
    id: "phenolphthalein",
    name: "Phenolphthalein",
    formula: "C₂₀H₁₄O₄",
    color: COLORLESS_TINT,
    colorless: true,
    role: "indicator",
    aliquotMl: 5,
  },
  {
    id: "cuso4",
    name: "Copper(II) Sulfate",
    formula: "CuSO₄",
    color: "#2f6fd0",
    colorless: false,
    role: "salt",
    concentrationM: 0.1,
    aliquotMl: 25,
    hazard: "Irritant",
  },
  {
    id: "kmno4",
    name: "Potassium Permanganate",
    formula: "KMnO₄",
    color: "#7a2b96",
    colorless: false,
    role: "salt",
    concentrationM: 0.05,
    aliquotMl: 20,
    hazard: "Oxidiser",
  },
  {
    id: "agno3",
    name: "Silver Nitrate",
    formula: "AgNO₃",
    color: COLORLESS_TINT,
    colorless: true,
    role: "salt",
    concentrationM: 0.1,
    aliquotMl: 20,
    hazard: "Corrosive",
  },
  {
    id: "nacl",
    name: "Sodium Chloride",
    formula: "NaCl",
    color: COLORLESS_TINT,
    colorless: true,
    role: "salt",
    concentrationM: 0.1,
    aliquotMl: 25,
  },
  {
    id: "na2co3",
    name: "Sodium Carbonate",
    formula: "Na₂CO₃",
    color: COLORLESS_TINT,
    colorless: true,
    role: "base",
    concentrationM: 0.1,
    aliquotMl: 25,
  },
  {
    id: "h2so4",
    name: "Sulfuric Acid",
    formula: "H₂SO₄",
    color: COLORLESS_TINT,
    colorless: true,
    role: "acid",
    concentrationM: 0.1,
    aliquotMl: 25,
    hazard: "Corrosive",
  },
  {
    id: "ammonia",
    name: "Ammonia Solution",
    formula: "NH₃",
    color: COLORLESS_TINT,
    colorless: true,
    role: "base",
    concentrationM: 0.1,
    aliquotMl: 25,
    hazard: "Irritant",
  },
  {
    id: "fecl3",
    name: "Iron(III) Chloride",
    formula: "FeCl₃",
    color: "#c07d2a",
    colorless: false,
    role: "salt",
    concentrationM: 0.1,
    aliquotMl: 25,
    hazard: "Irritant",
  },
  {
    id: "pb_no3",
    name: "Lead(II) Nitrate",
    formula: "Pb(NO₃)₂",
    color: COLORLESS_TINT,
    colorless: true,
    role: "salt",
    concentrationM: 0.1,
    aliquotMl: 20,
    hazard: "Toxic",
  },
  {
    id: "ki",
    name: "Potassium Iodide",
    formula: "KI",
    color: COLORLESS_TINT,
    colorless: true,
    role: "salt",
    concentrationM: 0.1,
    aliquotMl: 20,
  },
  {
    id: "bacl2",
    name: "Barium Chloride",
    formula: "BaCl₂",
    color: COLORLESS_TINT,
    colorless: true,
    role: "salt",
    concentrationM: 0.1,
    aliquotMl: 20,
    hazard: "Toxic",
  },
  {
    id: "cocl2",
    name: "Cobalt(II) Chloride",
    formula: "CoCl₂",
    color: "#d85f92",
    colorless: false,
    role: "salt",
    concentrationM: 0.1,
    aliquotMl: 20,
  },
  {
    id: "caco3",
    name: "Calcium Carbonate",
    formula: "CaCO₃",
    color: COLORLESS_TINT,
    colorless: true,
    role: "salt",
    aliquotMl: 15,
  },
  {
    id: "methyl_orange",
    name: "Methyl Orange",
    formula: "C₁₄H₁₄N₃NaO₃S",
    color: COLORLESS_TINT,
    colorless: true,
    role: "indicator",
    aliquotMl: 5,
  },
  {
    id: "bromothymol",
    name: "Bromothymol Blue",
    formula: "C₂₇H₂₈Br₂O₅S",
    color: COLORLESS_TINT,
    colorless: true,
    role: "indicator",
    aliquotMl: 5,
  },
];

export const REAGENTS_BY_ID: Record<string, Reagent> = Object.fromEntries(
  REAGENTS.map((r) => [r.id, r]),
);

export function getReagent(id: string): Reagent | undefined {
  return REAGENTS_BY_ID[id];
}
