/**
 * Bundled molecule library (Module 3 · §3.2 / §3.3).
 *
 * Curated compounds whose 3D structures ship with the app as local SDF files
 * (public/structures/<key>.sdf), fetched once from PubChem. These render
 * instantly and work offline; anything outside this set resolves at runtime
 * through the /api/molecule PubChem proxy. SMILES drives the 2D skeletal
 * diagram (RDKit.js).
 */
export interface MoleculeEntry {
  key: string; // matches public/structures/<key>.sdf
  name: string;
  formula: string;
  smiles: string; // for the 2D <StructureDiagram>
  cid: number; // PubChem CID (provenance)
  kind: "organic" | "inorganic";
}

export const MOLECULE_LIBRARY: MoleculeEntry[] = [
  { key: "water", name: "Water", formula: "H2O", smiles: "O", cid: 962, kind: "inorganic" },
  { key: "carbon-dioxide", name: "Carbon dioxide", formula: "CO2", smiles: "O=C=O", cid: 280, kind: "inorganic" },
  { key: "ammonia", name: "Ammonia", formula: "NH3", smiles: "N", cid: 222, kind: "inorganic" },
  { key: "methane", name: "Methane", formula: "CH4", smiles: "C", cid: 297, kind: "organic" },
  { key: "ethane", name: "Ethane", formula: "C2H6", smiles: "CC", cid: 6324, kind: "organic" },
  { key: "ethene", name: "Ethene", formula: "C2H4", smiles: "C=C", cid: 6325, kind: "organic" },
  { key: "methanol", name: "Methanol", formula: "CH4O", smiles: "CO", cid: 887, kind: "organic" },
  { key: "ethanol", name: "Ethanol", formula: "C2H6O", smiles: "CCO", cid: 702, kind: "organic" },
  { key: "acetic-acid", name: "Acetic acid", formula: "C2H4O2", smiles: "CC(=O)O", cid: 176, kind: "organic" },
  { key: "acetone", name: "Acetone", formula: "C3H6O", smiles: "CC(=O)C", cid: 180, kind: "organic" },
  { key: "benzene", name: "Benzene", formula: "C6H6", smiles: "c1ccccc1", cid: 241, kind: "organic" },
  { key: "glucose", name: "Glucose", formula: "C6H12O6", smiles: "C(C1C(C(C(C(O1)O)O)O)O)O", cid: 5793, kind: "organic" },
  { key: "caffeine", name: "Caffeine", formula: "C8H10N4O2", smiles: "CN1C=NC2=C1C(=O)N(C(=O)N2C)C", cid: 2519, kind: "organic" },
  { key: "aspirin", name: "Aspirin", formula: "C9H8O4", smiles: "CC(=O)OC1=CC=CC=C1C(=O)O", cid: 2244, kind: "organic" },
];

export const MOLECULE_BY_KEY: Record<string, MoleculeEntry> = Object.fromEntries(
  MOLECULE_LIBRARY.map((m) => [m.key, m]),
);
