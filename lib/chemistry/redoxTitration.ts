/**
 * Redox titration (deferred Module 2 · General chemistry).
 *
 * At the equivalence point electrons balance:
 *   n(analyte)·c(analyte)·V(analyte) = n(titrant)·c(titrant)·V(titrant)
 * where n is the electrons transferred per formula unit. Solve for the unknown
 * analyte concentration (volumes cancel, so any consistent unit works).
 * Pure/self-contained.
 */
export interface RedoxTitration {
  cTitrant: number; // mol/L
  vTitrant: number; // volume delivered at equivalence
  nTitrant: number; // electrons gained per titrant formula unit
  vAnalyte: number; // analyte volume (same unit as vTitrant)
  nAnalyte: number; // electrons lost per analyte formula unit
}

export function redoxTitrationConcentration(t: RedoxTitration): number {
  return (t.cTitrant * t.vTitrant * t.nTitrant) / (t.vAnalyte * t.nAnalyte);
}

export interface RedoxTitrationPreset {
  id: string;
  label: string;
  equation: string;
  titrant: string;
  analyte: string;
  nTitrant: number;
  nAnalyte: number;
}

export const REDOX_TITRATIONS: RedoxTitrationPreset[] = [
  {
    id: "mno4-fe",
    label: "KMnO₄ vs Fe²⁺",
    equation: "MnO₄⁻ + 5Fe²⁺ + 8H⁺ → Mn²⁺ + 5Fe³⁺ + 4H₂O",
    titrant: "MnO₄⁻",
    analyte: "Fe²⁺",
    nTitrant: 5,
    nAnalyte: 1,
  },
  {
    id: "mno4-ox",
    label: "KMnO₄ vs oxalate",
    equation: "2MnO₄⁻ + 5C₂O₄²⁻ + 16H⁺ → 2Mn²⁺ + 10CO₂ + 8H₂O",
    titrant: "MnO₄⁻",
    analyte: "C₂O₄²⁻",
    nTitrant: 5,
    nAnalyte: 2,
  },
  {
    id: "cr2o7-fe",
    label: "K₂Cr₂O₇ vs Fe²⁺",
    equation: "Cr₂O₇²⁻ + 6Fe²⁺ + 14H⁺ → 2Cr³⁺ + 6Fe³⁺ + 7H₂O",
    titrant: "Cr₂O₇²⁻",
    analyte: "Fe²⁺",
    nTitrant: 6,
    nAnalyte: 1,
  },
  {
    id: "i2-thio",
    label: "I₂ vs thiosulfate",
    equation: "I₂ + 2S₂O₃²⁻ → 2I⁻ + S₄O₆²⁻",
    titrant: "I₂",
    analyte: "S₂O₃²⁻",
    nTitrant: 2,
    nAnalyte: 1,
  },
];
