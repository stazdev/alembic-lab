/**
 * In-browser molecular property estimation via OpenChemLib (pure JS, no server,
 * no model download). Loaded lazily so the ~1 MB library never touches the
 * initial bundle. Every value here is an ESTIMATE — the UI must label it so.
 *
 * OpenChemLib's `MoleculeProperties` computes logP, aqueous solubility (logS),
 * TPSA, H-bond counts, and rotatable bonds directly from structure; these need
 * no external resource registration. (Its toxicity predictor is deliberately
 * NOT surfaced — it produced chemically nonsensical output in validation.)
 */

export interface PredictedProperties {
  formula: string;
  molWeight: number;
  /** Estimated octanol–water partition coefficient (lipophilicity). */
  logP: number;
  /** Estimated log₁₀ aqueous solubility (mol/L). Higher = more soluble. */
  logS: number;
  /** Topological polar surface area (Å²). */
  tpsa: number;
  hbd: number;
  hba: number;
  rotatableBonds: number;
  /** Lipinski "Rule of 5" — computed deterministically from the values above. */
  lipinski: { passes: boolean; violations: string[] };
}

/** The sliver of OpenChemLib's surface we use — avoids pulling its full types. */
interface OCLMolecule {
  getAllAtoms(): number;
  getMolecularFormula(): { formula: string; relativeWeight: number };
}
interface OCLProps {
  logP: number;
  logS: number;
  polarSurfaceArea: number;
  donorCount: number;
  acceptorCount: number;
  rotatableBondCount: number;
}
interface OCL {
  Molecule: { fromSmiles(smiles: string): OCLMolecule };
  MoleculeProperties: new (mol: OCLMolecule) => OCLProps;
}

let oclPromise: Promise<OCL> | null = null;

async function getOCL(): Promise<OCL> {
  if (!oclPromise) {
    oclPromise = import("openchemlib").then((mod) => {
      // UMD/ESM interop: named exports may sit on the namespace or on `default`.
      const ns = mod as unknown as Record<string, unknown>;
      return ("Molecule" in ns ? ns : ns.default) as unknown as OCL;
    });
  }
  return oclPromise;
}

/**
 * Estimate properties from a SMILES string. Returns null for empty/invalid
 * input (OpenChemLib throws on unparseable SMILES).
 */
export async function predictProperties(
  smiles: string,
): Promise<PredictedProperties | null> {
  const trimmed = smiles?.trim();
  if (!trimmed) return null;

  const OCL = await getOCL();
  let mol;
  try {
    mol = OCL.Molecule.fromSmiles(trimmed);
  } catch {
    return null;
  }
  if (!mol || mol.getAllAtoms() === 0) return null;

  const props = new OCL.MoleculeProperties(mol);
  const mf = mol.getMolecularFormula();
  const molWeight: number = mf.relativeWeight;
  const logP: number = props.logP;
  const hbd: number = props.donorCount;
  const hba: number = props.acceptorCount;

  const violations: string[] = [];
  if (molWeight > 500) violations.push("Molar mass > 500");
  if (logP > 5) violations.push("logP > 5");
  if (hbd > 5) violations.push("H-bond donors > 5");
  if (hba > 10) violations.push("H-bond acceptors > 10");

  return {
    formula: mf.formula,
    molWeight,
    logP,
    logS: props.logS,
    tpsa: props.polarSurfaceArea,
    hbd,
    hba,
    rotatableBonds: props.rotatableBondCount,
    // Ro5 tolerates a single violation.
    lipinski: { passes: violations.length <= 1, violations },
  };
}
