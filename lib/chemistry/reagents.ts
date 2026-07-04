/**
 * Reagents the student can add to a vessel (§1.2).
 *
 * A curated but broad bench set — acids, bases, salts, indicators, and a row of
 * reactive-metal elements. Pure display data; the dissociation/reaction rules
 * live in species.ts and the engine in resolve.ts, so any combination reacts
 * from first principles (solubility rules + activity series), not a fixed list.
 */

export type ReagentRole =
  | "acid"
  | "base"
  | "indicator"
  | "salt"
  | "solvent"
  | "metal";

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
const T = COLORLESS_TINT;

export const REAGENTS: Reagent[] = [
  // ── Solvent ──
  { id: "water", name: "Distilled Water", formula: "H₂O", color: T, colorless: true, role: "solvent", concentrationM: 55, aliquotMl: 40 },

  // ── Acids ──
  { id: "hcl", name: "Hydrochloric Acid", formula: "HCl", color: T, colorless: true, role: "acid", concentrationM: 1, aliquotMl: 25, hazard: "Corrosive" },
  { id: "h2so4", name: "Sulfuric Acid", formula: "H₂SO₄", color: T, colorless: true, role: "acid", concentrationM: 1, aliquotMl: 25, hazard: "Corrosive" },
  { id: "hno3", name: "Nitric Acid", formula: "HNO₃", color: T, colorless: true, role: "acid", concentrationM: 1, aliquotMl: 25, hazard: "Corrosive · oxidiser" },
  { id: "acetic", name: "Acetic Acid", formula: "CH₃COOH", color: T, colorless: true, role: "acid", concentrationM: 1, aliquotMl: 25, hazard: "Irritant" },

  // ── Bases ──
  { id: "naoh", name: "Sodium Hydroxide", formula: "NaOH", color: T, colorless: true, role: "base", concentrationM: 1, aliquotMl: 25, hazard: "Corrosive" },
  { id: "koh", name: "Potassium Hydroxide", formula: "KOH", color: T, colorless: true, role: "base", concentrationM: 1, aliquotMl: 25, hazard: "Corrosive" },
  { id: "ammonia", name: "Ammonia Solution", formula: "NH₃", color: T, colorless: true, role: "base", concentrationM: 1, aliquotMl: 25, hazard: "Irritant" },
  { id: "na2co3", name: "Sodium Carbonate", formula: "Na₂CO₃", color: T, colorless: true, role: "base", concentrationM: 0.5, aliquotMl: 25 },
  { id: "nahco3", name: "Sodium Bicarbonate", formula: "NaHCO₃", color: T, colorless: true, role: "base", concentrationM: 0.5, aliquotMl: 25 },

  // ── Salts ──
  { id: "nacl", name: "Sodium Chloride", formula: "NaCl", color: T, colorless: true, role: "salt", concentrationM: 0.5, aliquotMl: 25 },
  { id: "kcl", name: "Potassium Chloride", formula: "KCl", color: T, colorless: true, role: "salt", concentrationM: 0.5, aliquotMl: 25 },
  { id: "kno3", name: "Potassium Nitrate", formula: "KNO₃", color: T, colorless: true, role: "salt", concentrationM: 0.5, aliquotMl: 25 },
  { id: "na2so4", name: "Sodium Sulfate", formula: "Na₂SO₄", color: T, colorless: true, role: "salt", concentrationM: 0.5, aliquotMl: 25 },
  { id: "nh4cl", name: "Ammonium Chloride", formula: "NH₄Cl", color: T, colorless: true, role: "salt", concentrationM: 0.5, aliquotMl: 25 },
  { id: "cuso4", name: "Copper(II) Sulfate", formula: "CuSO₄", color: "#2f6fd0", colorless: false, role: "salt", concentrationM: 0.5, aliquotMl: 25, hazard: "Irritant" },
  { id: "cucl2", name: "Copper(II) Chloride", formula: "CuCl₂", color: "#2f8f8f", colorless: false, role: "salt", concentrationM: 0.5, aliquotMl: 25, hazard: "Irritant" },
  { id: "fecl3", name: "Iron(III) Chloride", formula: "FeCl₃", color: "#c07d2a", colorless: false, role: "salt", concentrationM: 0.5, aliquotMl: 25, hazard: "Irritant" },
  { id: "feso4", name: "Iron(II) Sulfate", formula: "FeSO₄", color: "#8fb98f", colorless: false, role: "salt", concentrationM: 0.5, aliquotMl: 25 },
  { id: "znso4", name: "Zinc Sulfate", formula: "ZnSO₄", color: T, colorless: true, role: "salt", concentrationM: 0.5, aliquotMl: 25 },
  { id: "mgso4", name: "Magnesium Sulfate", formula: "MgSO₄", color: T, colorless: true, role: "salt", concentrationM: 0.5, aliquotMl: 25 },
  { id: "cacl2", name: "Calcium Chloride", formula: "CaCl₂", color: T, colorless: true, role: "salt", concentrationM: 0.5, aliquotMl: 25 },
  { id: "agno3", name: "Silver Nitrate", formula: "AgNO₃", color: T, colorless: true, role: "salt", concentrationM: 0.5, aliquotMl: 20, hazard: "Corrosive · stains" },
  { id: "pb_no3", name: "Lead(II) Nitrate", formula: "Pb(NO₃)₂", color: T, colorless: true, role: "salt", concentrationM: 0.5, aliquotMl: 20, hazard: "Toxic" },
  { id: "bacl2", name: "Barium Chloride", formula: "BaCl₂", color: T, colorless: true, role: "salt", concentrationM: 0.5, aliquotMl: 20, hazard: "Toxic" },
  { id: "ki", name: "Potassium Iodide", formula: "KI", color: T, colorless: true, role: "salt", concentrationM: 0.5, aliquotMl: 20 },
  { id: "kmno4", name: "Potassium Permanganate", formula: "KMnO₄", color: "#7a2b96", colorless: false, role: "salt", concentrationM: 0.1, aliquotMl: 20, hazard: "Oxidiser · stains" },
  { id: "k2cro4", name: "Potassium Chromate", formula: "K₂CrO₄", color: "#e6c72e", colorless: false, role: "salt", concentrationM: 0.3, aliquotMl: 20, hazard: "Toxic" },
  { id: "cocl2", name: "Cobalt(II) Chloride", formula: "CoCl₂", color: "#d85f92", colorless: false, role: "salt", concentrationM: 0.5, aliquotMl: 20 },
  { id: "caco3", name: "Calcium Carbonate", formula: "CaCO₃", color: T, colorless: true, role: "salt", concentrationM: 0.5, aliquotMl: 15 },

  // ── Indicators ──
  { id: "phenolphthalein", name: "Phenolphthalein", formula: "C₂₀H₁₄O₄", color: T, colorless: true, role: "indicator", aliquotMl: 5 },
  { id: "methyl_orange", name: "Methyl Orange", formula: "C₁₄H₁₄N₃NaO₃S", color: T, colorless: true, role: "indicator", aliquotMl: 5 },
  { id: "bromothymol", name: "Bromothymol Blue", formula: "C₂₇H₂₈Br₂O₅S", color: T, colorless: true, role: "indicator", aliquotMl: 5 },
  { id: "universal", name: "Universal Indicator", formula: "—", color: T, colorless: true, role: "indicator", aliquotMl: 5 },

  // ── Elements: reactive metals (reactivity series) ──
  { id: "k", name: "Potassium", formula: "K", color: "#c8c9cf", colorless: false, role: "metal", concentrationM: 2, aliquotMl: 5, hazard: "Reacts explosively with water" },
  { id: "na", name: "Sodium", formula: "Na", color: "#c9cace", colorless: false, role: "metal", concentrationM: 2, aliquotMl: 6, hazard: "Reacts violently with water" },
  { id: "li", name: "Lithium", formula: "Li", color: "#cfcabf", colorless: false, role: "metal", concentrationM: 2, aliquotMl: 6, hazard: "Reacts with water" },
  { id: "ca", name: "Calcium", formula: "Ca", color: "#d6d6cc", colorless: false, role: "metal", concentrationM: 2, aliquotMl: 8, hazard: "Reacts with water" },
  { id: "mg", name: "Magnesium", formula: "Mg", color: "#c2c2c6", colorless: false, role: "metal", concentrationM: 2, aliquotMl: 10 },
  { id: "al", name: "Aluminium", formula: "Al", color: "#bdbfc4", colorless: false, role: "metal", concentrationM: 2, aliquotMl: 10 },
  { id: "zn", name: "Zinc", formula: "Zn", color: "#a9abb0", colorless: false, role: "metal", concentrationM: 2, aliquotMl: 10 },
  { id: "fe", name: "Iron", formula: "Fe", color: "#8f9094", colorless: false, role: "metal", concentrationM: 2, aliquotMl: 10 },
  { id: "sn", name: "Tin", formula: "Sn", color: "#b6b7ba", colorless: false, role: "metal", concentrationM: 2, aliquotMl: 10 },
  { id: "pb", name: "Lead", formula: "Pb", color: "#8d8f96", colorless: false, role: "metal", concentrationM: 2, aliquotMl: 10, hazard: "Toxic" },
  { id: "cu", name: "Copper", formula: "Cu", color: "#b26a3d", colorless: false, role: "metal", concentrationM: 2, aliquotMl: 10 },
];

export const REAGENTS_BY_ID: Record<string, Reagent> = Object.fromEntries(
  REAGENTS.map((r) => [r.id, r]),
);

export function getReagent(id: string): Reagent | undefined {
  return REAGENTS_BY_ID[id];
}
