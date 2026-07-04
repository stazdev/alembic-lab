/**
 * Balancing generators — molecular equation balancing (ask for a coefficient)
 * and net-ionic redox balancing. Coefficients come from the verified balancer's
 * null-space solver, never authored.
 */
import { balanceEquation, balanceRedox, type RedoxTerm } from "@/lib/chemistry/balancer";
import { draw } from "./build";
import type { TaskGenerator } from "./types";

// display ↔ ascii formula (ascii feeds the parser); nR = number of reactants.
interface MolRxn {
  eq: string;
  species: [string, string][]; // [display, ascii], reactants then products
  nR: number;
}

const MOL_REACTIONS: MolRxn[] = [
  { eq: "C₃H₈ + O₂ → CO₂ + H₂O", nR: 2, species: [["C₃H₈", "C3H8"], ["O₂", "O2"], ["CO₂", "CO2"], ["H₂O", "H2O"]] },
  { eq: "C₂H₆ + O₂ → CO₂ + H₂O", nR: 2, species: [["C₂H₆", "C2H6"], ["O₂", "O2"], ["CO₂", "CO2"], ["H₂O", "H2O"]] },
  { eq: "C₄H₁₀ + O₂ → CO₂ + H₂O", nR: 2, species: [["C₄H₁₀", "C4H10"], ["O₂", "O2"], ["CO₂", "CO2"], ["H₂O", "H2O"]] },
  { eq: "C₂H₅OH + O₂ → CO₂ + H₂O", nR: 2, species: [["C₂H₅OH", "C2H5OH"], ["O₂", "O2"], ["CO₂", "CO2"], ["H₂O", "H2O"]] },
  { eq: "Fe + O₂ → Fe₂O₃", nR: 2, species: [["Fe", "Fe"], ["O₂", "O2"], ["Fe₂O₃", "Fe2O3"]] },
  { eq: "Al + O₂ → Al₂O₃", nR: 2, species: [["Al", "Al"], ["O₂", "O2"], ["Al₂O₃", "Al2O3"]] },
  { eq: "N₂ + H₂ → NH₃", nR: 2, species: [["N₂", "N2"], ["H₂", "H2"], ["NH₃", "NH3"]] },
  { eq: "KClO₃ → KCl + O₂", nR: 1, species: [["KClO₃", "KClO3"], ["KCl", "KCl"], ["O₂", "O2"]] },
  { eq: "Al + HCl → AlCl₃ + H₂", nR: 2, species: [["Al", "Al"], ["HCl", "HCl"], ["AlCl₃", "AlCl3"], ["H₂", "H2"]] },
  { eq: "Fe + HCl → FeCl₂ + H₂", nR: 2, species: [["Fe", "Fe"], ["HCl", "HCl"], ["FeCl₂", "FeCl2"], ["H₂", "H2"]] },
  { eq: "CaCO₃ + HCl → CaCl₂ + H₂O + CO₂", nR: 2, species: [["CaCO₃", "CaCO3"], ["HCl", "HCl"], ["CaCl₂", "CaCl2"], ["H₂O", "H2O"], ["CO₂", "CO2"]] },
  { eq: "AgNO₃ + CaCl₂ → AgCl + Ca(NO₃)₂", nR: 2, species: [["AgNO₃", "AgNO3"], ["CaCl₂", "CaCl2"], ["AgCl", "AgCl"], ["Ca(NO₃)₂", "Ca(NO3)2"]] },
  { eq: "Na + Cl₂ → NaCl", nR: 2, species: [["Na", "Na"], ["Cl₂", "Cl2"], ["NaCl", "NaCl"]] },
];

export const balanceCoefficientGen: TaskGenerator = {
  id: "balance-coefficient",
  topic: "Balancing",
  title: "Balance an equation",
  difficulties: ["Intro", "Core"],
  build({ rng, difficulty }) {
    const { rxn, coeffs, idx } = draw(
      () => {
        const rxn =
          difficulty === "Intro"
            ? rng.pick(MOL_REACTIONS.filter((r) => r.species.length <= 3))
            : rng.pick(MOL_REACTIONS);
        const reactants = rxn.species.slice(0, rxn.nR).map((s) => s[1]);
        const products = rxn.species.slice(rxn.nR).map((s) => s[1]);
        const res = balanceEquation(reactants, products);
        if (!res.ok) return { rxn, coeffs: null as number[] | null, idx: -1 };
        // Prefer asking about a coefficient greater than 1 (non-trivial).
        const candidates = res.coefficients
          .map((c, i) => ({ c, i }))
          .filter((x) => x.c > 1);
        const chosen = candidates.length ? rng.pick(candidates) : { c: res.coefficients[0], i: 0 };
        return { rxn, coeffs: res.coefficients, idx: chosen.i };
      },
      ({ coeffs, idx }) =>
        coeffs != null && idx >= 0 && coeffs.every((c) => Number.isInteger(c) && c > 0),
    );
    const answerCoeff = coeffs![idx];
    const target = rxn.species[idx][0];
    // Readable balanced string (→ separates reactants from products).
    const side = (from: number, to: number) =>
      rxn.species
        .slice(from, to)
        .map((s, i) => `${coeffs![from + i] === 1 ? "" : coeffs![from + i]}${s[0]}`)
        .join(" + ");
    const balancedStr = `${side(0, rxn.nR)} → ${side(rxn.nR, rxn.species.length)}`;
    return {
      title: "Balance an equation",
      prompt: `Balance the equation, then enter the coefficient of ${target}:\n  ${rxn.eq}`,
      given: [{ label: "Equation", value: rxn.eq }],
      answer: { kind: "numeric", value: answerCoeff, unit: "", tolerance: 0 },
      hints: [
        "Balance one element at a time; leave free elements like O₂ or H₂ for last.",
        "Every atom must appear in equal numbers on both sides — scale to the smallest whole numbers.",
      ],
      solution: `Balanced: ${balancedStr}. The coefficient of ${target} is ${answerCoeff}.`,
      toolHref: "/reactions",
    };
  },
};

// ── net-ionic redox ──
interface RedoxPreset {
  eq: string;
  reactants: string[];
  products: string[];
  medium: "acidic" | "basic";
  askable: { label: string; formula: string; charge: number }[];
}

const REDOX_PRESETS: RedoxPreset[] = [
  {
    eq: "MnO₄⁻ + Fe²⁺ → Mn²⁺ + Fe³⁺",
    reactants: ["MnO4-", "Fe^2+"], products: ["Mn^2+", "Fe^3+"], medium: "acidic",
    askable: [{ label: "H⁺", formula: "H", charge: 1 }, { label: "Fe²⁺", formula: "Fe", charge: 2 }, { label: "H₂O", formula: "H2O", charge: 0 }],
  },
  {
    eq: "Cr₂O₇²⁻ + Fe²⁺ → Cr³⁺ + Fe³⁺",
    reactants: ["Cr2O7^2-", "Fe^2+"], products: ["Cr^3+", "Fe^3+"], medium: "acidic",
    askable: [{ label: "H⁺", formula: "H", charge: 1 }, { label: "Fe²⁺", formula: "Fe", charge: 2 }, { label: "H₂O", formula: "H2O", charge: 0 }],
  },
  {
    eq: "MnO₄⁻ + C₂O₄²⁻ → Mn²⁺ + CO₂",
    reactants: ["MnO4-", "C2O4^2-"], products: ["Mn^2+", "CO2"], medium: "acidic",
    askable: [{ label: "H⁺", formula: "H", charge: 1 }, { label: "CO₂", formula: "CO2", charge: 0 }, { label: "H₂O", formula: "H2O", charge: 0 }],
  },
  {
    eq: "MnO₄⁻ + SO₃²⁻ → MnO₂ + SO₄²⁻  (basic)",
    reactants: ["MnO4-", "SO3^2-"], products: ["MnO2", "SO4^2-"], medium: "basic",
    askable: [{ label: "OH⁻", formula: "OH", charge: -1 }, { label: "SO₃²⁻", formula: "SO3", charge: -2 }, { label: "H₂O", formula: "H2O", charge: 0 }],
  },
];

const coeffOf = (terms: RedoxTerm[], formula: string, charge: number): number | null => {
  const t = terms.find((x) => x.formula === formula && x.charge === charge);
  return t ? t.coeff : null;
};

export const redoxCoefficientGen: TaskGenerator = {
  id: "balance-redox",
  topic: "Balancing",
  title: "Balance a redox equation",
  difficulties: ["Challenge"],
  build({ rng }) {
    const { preset, ask, coeff } = draw(
      () => {
        const preset = rng.pick(REDOX_PRESETS);
        const ask = rng.pick(preset.askable);
        const res = balanceRedox(preset.reactants, preset.products, preset.medium);
        if (!res.ok) return { preset, ask, coeff: null as number | null };
        const c = coeffOf(res.left, ask.formula, ask.charge) ?? coeffOf(res.right, ask.formula, ask.charge);
        return { preset, ask, coeff: c };
      },
      ({ coeff }) => coeff != null && Number.isInteger(coeff) && coeff > 0,
    );
    return {
      title: "Balance a redox equation",
      prompt: `Balance this net-ionic redox equation in ${preset.medium} solution, then enter the coefficient of ${ask.label}:\n  ${preset.eq}`,
      given: [
        { label: "Equation", value: preset.eq },
        { label: "Medium", value: preset.medium },
      ],
      answer: { kind: "numeric", value: coeff!, unit: "", tolerance: 0 },
      hints: [
        "Split into oxidation and reduction half-reactions; balance atoms, then O with H₂O and H with H⁺.",
        preset.medium === "basic"
          ? "In basic solution, neutralise H⁺ by adding OH⁻ to both sides."
          : "Balance charge with electrons, then scale so electrons cancel.",
      ],
      solution: `Balancing and cancelling electrons, the coefficient of ${ask.label} is ${coeff}.`,
      toolHref: "/reactions",
    };
  },
};
