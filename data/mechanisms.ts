/**
 * Reaction mechanism walkthroughs (deferred Module 2 · Organic).
 *
 * Pre-authored, stepped mechanisms. Each step narrates the electron movement
 * (curved arrows) and shows the key structure at that point, rendered in 2D by
 * RDKit (<StructureDiagram>). "Data over code."
 */
import type { ChemTerm } from "@/components/chem/ChemEquation";

export interface MechanismStep {
  title: string;
  description: string;
  smiles?: string; // key structure at this step (omitted for transition states)
  label?: string;
}

export interface Mechanism {
  id: string;
  name: string;
  type: string;
  summary: string;
  overallReactants: ChemTerm[];
  overallProducts: ChemTerm[];
  steps: MechanismStep[];
}

export const MECHANISMS: Mechanism[] = [
  {
    id: "sn2",
    name: "SN2 — hydroxide + bromomethane",
    type: "Nucleophilic substitution (SN2)",
    summary:
      "A one-step, concerted substitution: the nucleophile attacks as the leaving group departs, so the rate depends on both — second order overall.",
    overallReactants: [{ formula: "OH", charge: -1 }, { formula: "CH3Br" }],
    overallProducts: [{ formula: "CH3OH" }, { formula: "Br", charge: -1 }],
    steps: [
      {
        title: "Backside attack",
        description:
          "The hydroxide lone pair attacks the electrophilic carbon from the side directly opposite the C–Br bond. A curved arrow runs from the oxygen lone pair to carbon.",
        smiles: "CBr",
        label: "Bromomethane (substrate)",
      },
      {
        title: "Concerted transition state",
        description:
          "In a single step the C–O bond forms as the C–Br bond breaks. Carbon is momentarily five-coordinate (trigonal bipyramidal) and its other three bonds invert like an umbrella in the wind.",
      },
      {
        title: "Inversion & products",
        description:
          "Bromide leaves with the bonding electrons; methanol forms with inverted configuration (Walden inversion).",
        smiles: "CO",
        label: "Methanol (product)",
      },
    ],
  },
  {
    id: "sn1",
    name: "SN1 — hydrolysis of tert-butyl bromide",
    type: "Nucleophilic substitution (SN1)",
    summary:
      "A stepwise substitution via a carbocation. The slow ionization step is rate-determining, so the rate depends only on the substrate — first order.",
    overallReactants: [{ formula: "(CH3)3CBr" }, { formula: "H2O" }],
    overallProducts: [{ formula: "(CH3)3COH" }, { formula: "HBr" }],
    steps: [
      {
        title: "Ionization (slow, rate-determining)",
        description:
          "The C–Br bond breaks heterolytically — both electrons leave with bromide. This slow step forms a planar tertiary carbocation, stabilized by the three electron-donating methyl groups.",
        smiles: "CC(C)(C)Br",
        label: "tert-Butyl bromide",
      },
      {
        title: "Planar carbocation",
        description:
          "The sp²-hybridized carbocation is trigonal planar, so a nucleophile can approach equally from either face.",
        smiles: "C[C+](C)C",
        label: "tert-Butyl cation",
      },
      {
        title: "Nucleophilic attack",
        description:
          "A water molecule donates a lone pair to the carbocation. Because both faces are open, this leads to racemization at the reacting carbon.",
        smiles: "CC(C)(C)Br",
        label: "attack on the cation",
      },
      {
        title: "Deprotonation",
        description:
          "A second water removes the extra proton from the oxonium ion, giving the neutral tertiary alcohol.",
        smiles: "CC(C)(C)O",
        label: "tert-Butanol (product)",
      },
    ],
  },
  {
    id: "addition",
    name: "Electrophilic addition — bromine + ethene",
    type: "Electrophilic addition",
    summary:
      "Bromine adds across the C=C double bond via a cyclic bromonium ion, giving anti (trans) addition. This is the test for unsaturation — bromine water is decolourised.",
    overallReactants: [{ formula: "C2H4" }, { formula: "Br2" }],
    overallProducts: [{ formula: "C2H4Br2" }],
    steps: [
      {
        title: "π-bond attack",
        description:
          "The electron-rich C=C π bond attacks a bromine molecule. As the π electrons form a bond to one bromine, the Br–Br bond breaks heterolytically, releasing bromide.",
        smiles: "C=C",
        label: "Ethene",
      },
      {
        title: "Bromonium ion",
        description:
          "A three-membered cyclic bromonium ion bridges both carbons. This blocks one face of the molecule and enforces anti addition.",
        smiles: "C1C[Br+]1",
        label: "Bromonium ion",
      },
      {
        title: "Anti addition",
        description:
          "Bromide attacks a carbon from the face opposite the bromonium, opening the ring. The two bromines end up on opposite sides — 1,2-dibromoethane.",
        smiles: "BrCCBr",
        label: "1,2-Dibromoethane (product)",
      },
    ],
  },
];
