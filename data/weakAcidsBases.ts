/**
 * Common weak acids and bases with their pKa / pKb (§2.1 presets).
 * Data over code — used to prefill the pH & titration tool.
 */
export interface AcidBasePreset {
  name: string;
  formula: string;
  pK: number; // pKa for acids, pKb for bases
}

export const WEAK_ACIDS: AcidBasePreset[] = [
  { name: "Acetic acid", formula: "CH3COOH", pK: 4.76 },
  { name: "Formic acid", formula: "HCOOH", pK: 3.75 },
  { name: "Hydrofluoric acid", formula: "HF", pK: 3.17 },
  { name: "Benzoic acid", formula: "C6H5COOH", pK: 4.2 },
  { name: "Carbonic acid", formula: "H2CO3", pK: 6.35 },
];

export const WEAK_BASES: AcidBasePreset[] = [
  { name: "Ammonia", formula: "NH3", pK: 4.75 },
  { name: "Methylamine", formula: "CH3NH2", pK: 3.36 },
  { name: "Pyridine", formula: "C5H5N", pK: 8.75 },
  { name: "Hydrazine", formula: "N2H4", pK: 5.9 },
];
