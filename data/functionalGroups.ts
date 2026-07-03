/**
 * Functional-group qualitative tests (deferred Module 2 · Organic).
 *
 * A reference matrix of common bench tests and how each functional group
 * responds — the classic identification scheme. "Data over code."
 */
export interface FGroup {
  id: string;
  name: string;
  example: string;
  moleculeKey?: string; // bundled 3D structure, where available
}

export interface FGTest {
  id: string;
  reagent: string;
  /** Observation keyed by group id; null = no visible reaction. */
  results: Record<string, string | null>;
}

export const FUNCTIONAL_GROUPS: FGroup[] = [
  { id: "alkene", name: "Alkene", example: "ethene", moleculeKey: "ethene" },
  { id: "alcohol", name: "Alcohol", example: "ethanol", moleculeKey: "ethanol" },
  { id: "aldehyde", name: "Aldehyde", example: "ethanal" },
  { id: "ketone", name: "Ketone", example: "acetone", moleculeKey: "acetone" },
  { id: "carboxylic", name: "Carboxylic acid", example: "ethanoic acid", moleculeKey: "acetic-acid" },
  { id: "phenol", name: "Phenol", example: "phenol" },
];

const NONE: Record<string, string | null> = {
  alkene: null,
  alcohol: null,
  aldehyde: null,
  ketone: null,
  carboxylic: null,
  phenol: null,
};

export const FG_TESTS: FGTest[] = [
  {
    id: "br2",
    reagent: "Bromine water",
    results: { ...NONE, alkene: "Orange → colourless", phenol: "Decolourised + white ppt" },
  },
  {
    id: "dnph",
    reagent: "2,4-DNPH (Brady's)",
    results: { ...NONE, aldehyde: "Orange ppt", ketone: "Orange ppt" },
  },
  {
    id: "tollens",
    reagent: "Tollens' reagent",
    results: { ...NONE, aldehyde: "Silver mirror" },
  },
  {
    id: "fehlings",
    reagent: "Fehling's solution",
    results: { ...NONE, aldehyde: "Brick-red ppt" },
  },
  {
    id: "nahco3",
    reagent: "NaHCO₃(aq)",
    results: { ...NONE, carboxylic: "Effervescence (CO₂)" },
  },
  {
    id: "fecl3",
    reagent: "Neutral FeCl₃",
    results: { ...NONE, phenol: "Violet colour" },
  },
];
