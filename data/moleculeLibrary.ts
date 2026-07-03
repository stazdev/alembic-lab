/**
 * Bundled molecule library (Module 3 · §3.2).
 *
 * Curated compounds whose 3D structures ship with the app as local SDF files
 * (public/structures/<key>.sdf), fetched once from PubChem. These render
 * instantly and work offline; anything outside this set resolves at runtime
 * through the /api/molecule PubChem proxy.
 */
export interface MoleculeEntry {
  key: string; // matches public/structures/<key>.sdf
  name: string;
  formula: string;
  cid: number; // PubChem CID (provenance)
  kind: "organic" | "inorganic";
}

export const MOLECULE_LIBRARY: MoleculeEntry[] = [
  { key: "water", name: "Water", formula: "H2O", cid: 962, kind: "inorganic" },
  { key: "carbon-dioxide", name: "Carbon dioxide", formula: "CO2", cid: 280, kind: "inorganic" },
  { key: "ammonia", name: "Ammonia", formula: "NH3", cid: 222, kind: "inorganic" },
  { key: "methane", name: "Methane", formula: "CH4", cid: 297, kind: "organic" },
  { key: "ethane", name: "Ethane", formula: "C2H6", cid: 6324, kind: "organic" },
  { key: "ethene", name: "Ethene", formula: "C2H4", cid: 6325, kind: "organic" },
  { key: "methanol", name: "Methanol", formula: "CH4O", cid: 887, kind: "organic" },
  { key: "ethanol", name: "Ethanol", formula: "C2H6O", cid: 702, kind: "organic" },
  { key: "acetic-acid", name: "Acetic acid", formula: "C2H4O2", cid: 176, kind: "organic" },
  { key: "acetone", name: "Acetone", formula: "C3H6O", cid: 180, kind: "organic" },
  { key: "benzene", name: "Benzene", formula: "C6H6", cid: 241, kind: "organic" },
  { key: "glucose", name: "Glucose", formula: "C6H12O6", cid: 5793, kind: "organic" },
  { key: "caffeine", name: "Caffeine", formula: "C8H10N4O2", cid: 2519, kind: "organic" },
  { key: "aspirin", name: "Aspirin", formula: "C9H8O4", cid: 2244, kind: "organic" },
];

export const MOLECULE_BY_KEY: Record<string, MoleculeEntry> = Object.fromEntries(
  MOLECULE_LIBRARY.map((m) => [m.key, m]),
);
