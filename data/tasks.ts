/**
 * Guided tasks (Module 2 · §2.3 Curriculum Integration).
 *
 * The Task/Scenario schema binds learning objectives to a prompt, staged
 * scaffolds (hints), and success criteria. Crucially, each numeric answer is
 * COMPUTED by the verified Module 2 engines — so grading can never drift from
 * the tools the student uses.
 */
import { molarMass } from "@/lib/chemistry/stoichiometry";
import { balanceEquation } from "@/lib/chemistry/balancer";
import { pKaToKa, strongAcidPH, weakAcidPH, bufferPH } from "@/lib/chemistry/ph";
import { reactionThermo } from "@/lib/chemistry/thermo";
import { halfLife, activationEnergy } from "@/lib/chemistry/kinetics";
import { solveIdeal, solveCombined } from "@/lib/chemistry/gasLaws";
import { michaelisMenten, rateFraction } from "@/lib/chemistry/enzymeKinetics";
import { standardCellPotential, nernst } from "@/lib/chemistry/electrochemistry";
import { HALF_BY_ID } from "@/data/reductionPotentials";
import { molarSolubility } from "@/lib/chemistry/equilibrium";
import { redoxTitrationConcentration } from "@/lib/chemistry/redoxTitration";
import { THERMO_BY_ID } from "@/data/thermoData";

export type TaskTopic =
  | "Balancing"
  | "Stoichiometry"
  | "pH"
  | "Thermodynamics"
  | "Kinetics"
  | "Gas Laws"
  | "Enzyme Kinetics"
  | "Electrochemistry"
  | "Equilibrium"
  | "Titration"
  | "Organic"
  | "Biochemistry";

export type TaskDifficulty = "Intro" | "Core" | "Challenge";

export type TaskAnswer =
  | { kind: "numeric"; value: number; unit?: string; tolerance: number }
  | { kind: "choice"; options: string[]; correctIndex: number };

export interface Task {
  id: string;
  title: string;
  topic: TaskTopic;
  difficulty: TaskDifficulty;
  objectives: string[];
  prompt: string;
  /** Optional bundled molecule (public/structures/<key>.sdf) shown in a 3D viewer. */
  moleculeKey?: string;
  given?: { label: string; value: string }[];
  answer: TaskAnswer;
  hints: string[];
  solution: string;
  toolHref?: string;
}

// ── engine helpers (answers derive from the real engines) ──────
const mm = (formula: string): number => {
  const r = molarMass(formula);
  return r.ok ? r.value.molarMass : NaN;
};
const coeff = (reactants: string[], products: string[], index: number): number => {
  const r = balanceEquation(reactants, products);
  return r.ok ? r.coefficients[index] : NaN;
};
const term = (id: string, c: number) => {
  const s = THERMO_BY_ID[id];
  return { dHf: s.dHf, s: s.s, coeff: c };
};
const idealVal = (known: Parameters<typeof solveIdeal>[0]): number => {
  const r = solveIdeal(known);
  return r.ok ? r.value : NaN;
};
const combinedVal = (known: Parameters<typeof solveCombined>[0]): number => {
  const r = solveCombined(known);
  return r.ok ? r.value : NaN;
};

const haber = reactionThermo(
  [term("N2(g)", 1), term("H2(g)", 3)],
  [term("NH3(g)", 2)],
);
const methaneDH = reactionThermo(
  [term("CH4(g)", 1), term("O2(g)", 2)],
  [term("CO2(g)", 1), term("H2O(l)", 2)],
).dH;

export const TASKS: Task[] = [
  {
    id: "bal-propane",
    title: "Balance propane combustion",
    topic: "Balancing",
    difficulty: "Intro",
    objectives: ["Balance a combustion equation", "Read a stoichiometric coefficient"],
    prompt:
      "Balance the combustion of propane, then enter the coefficient of O₂:  C₃H₈ + O₂ → CO₂ + H₂O",
    answer: { kind: "numeric", value: coeff(["C3H8", "O2"], ["CO2", "H2O"], 1), tolerance: 0 },
    hints: [
      "Balance carbon first: 3 C on the left means 3 CO₂ on the right.",
      "Then hydrogen: 8 H means 4 H₂O. Now total the oxygens on the right.",
      "Right side has 3×2 + 4×1 = 10 O atoms, so you need 5 O₂.",
    ],
    solution: "C₃H₈ + 5O₂ → 3CO₂ + 4H₂O. The coefficient of O₂ is 5.",
    toolHref: "/reactions",
  },
  {
    id: "bal-rust",
    title: "Balance the rusting of iron",
    topic: "Balancing",
    difficulty: "Intro",
    objectives: ["Balance a synthesis equation with a diatomic element"],
    prompt: "Balance  Fe + O₂ → Fe₂O₃  and enter the coefficient of Fe.",
    answer: { kind: "numeric", value: coeff(["Fe", "O2"], ["Fe2O3"], 0), tolerance: 0 },
    hints: [
      "Fe₂O₃ has 3 oxygens; O₂ comes in pairs, so use the lowest common multiple (6 O).",
      "6 O needs 3 O₂ and makes 2 Fe₂O₃, which contains 4 Fe.",
    ],
    solution: "4Fe + 3O₂ → 2Fe₂O₃. The coefficient of Fe is 4.",
    toolHref: "/reactions",
  },
  {
    id: "stoich-molar-mass",
    title: "Molar mass of glucose",
    topic: "Stoichiometry",
    difficulty: "Intro",
    objectives: ["Compute a molar mass from a formula"],
    prompt: "What is the molar mass of glucose, C₆H₁₂O₆?",
    answer: { kind: "numeric", value: mm("C6H12O6"), unit: "g/mol", tolerance: 0.5 },
    hints: ["Add 6×C + 12×H + 6×O.", "C ≈ 12.011, H ≈ 1.008, O ≈ 15.999."],
    solution: "6(12.011) + 12(1.008) + 6(15.999) = 180.16 g/mol.",
    toolHref: "/reactions",
  },
  {
    id: "stoich-limiting",
    title: "Identify the limiting reagent",
    topic: "Stoichiometry",
    difficulty: "Core",
    objectives: ["Convert mass to moles", "Compare mole ratios to find the limiting reagent"],
    prompt: "4.0 g of H₂ reacts with 32 g of O₂ via 2H₂ + O₂ → 2H₂O. Which reagent is limiting?",
    given: [
      { label: "H₂", value: "4.0 g" },
      { label: "O₂", value: "32 g" },
    ],
    answer: { kind: "choice", options: ["H₂", "O₂"], correctIndex: 0 },
    hints: [
      "moles H₂ = 4.0 / 2.016 ≈ 1.98; moles O₂ = 32 / 32.00 ≈ 1.00.",
      "Divide by coefficients: H₂ → 1.98/2 = 0.99; O₂ → 1.00/1 = 1.00. The smaller one limits.",
    ],
    solution: "H₂ gives the smaller ratio (0.99 vs 1.00), so H₂ is the limiting reagent.",
    toolHref: "/reactions",
  },
  {
    id: "stoich-yield",
    title: "Theoretical yield of water",
    topic: "Stoichiometry",
    difficulty: "Core",
    objectives: ["Use the limiting reagent to find theoretical yield"],
    prompt: "From 4.0 g H₂ and 32 g O₂ (2H₂ + O₂ → 2H₂O), what mass of water forms?",
    answer: { kind: "numeric", value: (4 / mm("H2")) * mm("H2O"), unit: "g", tolerance: 0.4 },
    hints: [
      "H₂ is limiting: 4.0 / 2.016 ≈ 1.98 mol H₂.",
      "The ratio H₂ : H₂O is 2 : 2, so 1.98 mol H₂O forms. Multiply by 18.02 g/mol.",
    ],
    solution: "1.98 mol H₂O × 18.02 g/mol ≈ 35.7 g of water.",
    toolHref: "/reactions",
  },
  {
    id: "stoich-solution",
    title: "Prepare a salt solution",
    topic: "Stoichiometry",
    difficulty: "Core",
    objectives: ["Relate molarity, volume, moles, and mass"],
    prompt: "How many grams of NaCl are needed to prepare 0.50 L of a 0.20 M solution?",
    answer: { kind: "numeric", value: 0.2 * 0.5 * mm("NaCl"), unit: "g", tolerance: 0.1 },
    hints: ["moles = C × V = 0.20 × 0.50 = 0.10 mol.", "mass = moles × molar mass (NaCl ≈ 58.44)."],
    solution: "0.10 mol × 58.44 g/mol ≈ 5.84 g of NaCl.",
    toolHref: "/reactions",
  },
  {
    id: "ph-strong",
    title: "pH of a strong acid",
    topic: "pH",
    difficulty: "Intro",
    objectives: ["Apply pH = −log[H⁺] for a strong acid"],
    prompt: "What is the pH of 0.010 M hydrochloric acid?",
    answer: { kind: "numeric", value: strongAcidPH(0.01), unit: "", tolerance: 0.05 },
    hints: ["HCl dissociates fully, so [H⁺] = 0.010 M.", "pH = −log(0.010)."],
    solution: "pH = −log(0.010) = 2.00.",
    toolHref: "/reactions",
  },
  {
    id: "ph-weak",
    title: "pH of a weak acid",
    topic: "pH",
    difficulty: "Core",
    objectives: ["Set up an ICE table / Ka expression for a weak acid"],
    prompt: "What is the pH of 0.10 M acetic acid (pKa = 4.76)?",
    answer: { kind: "numeric", value: weakAcidPH(0.1, pKaToKa(4.76)), unit: "", tolerance: 0.1 },
    hints: ["Ka = 10^(−4.76) ≈ 1.7×10⁻⁵.", "Solve Ka = x²/(0.10 − x) for x = [H⁺], then pH = −log x."],
    solution: "x = [H⁺] ≈ 1.3×10⁻³, so pH ≈ 2.88.",
    toolHref: "/reactions",
  },
  {
    id: "ph-halfeq",
    title: "Half-equivalence point",
    topic: "pH",
    difficulty: "Core",
    objectives: ["Connect the buffer region to pKa"],
    prompt:
      "In the titration of a weak acid (pKa = 4.76) with strong base, what is the pH at the half-equivalence point?",
    answer: { kind: "numeric", value: 4.76, unit: "", tolerance: 0.05 },
    hints: ["At half-equivalence, [HA] = [A⁻].", "Henderson–Hasselbalch: pH = pKa + log(1) = pKa."],
    solution: "When [HA] = [A⁻], pH = pKa = 4.76.",
    toolHref: "/reactions",
  },
  {
    id: "thermo-combustion",
    title: "Enthalpy of combustion",
    topic: "Thermodynamics",
    difficulty: "Core",
    objectives: ["Apply Hess's law with standard enthalpies of formation"],
    prompt: "Find ΔH° for CH₄(g) + 2O₂(g) → CO₂(g) + 2H₂O(l) using standard enthalpies of formation.",
    answer: { kind: "numeric", value: methaneDH, unit: "kJ/mol", tolerance: 2 },
    hints: [
      "ΔH° = Σ ΔHf°(products) − Σ ΔHf°(reactants).",
      "ΔHf°: CO₂ −393.5, H₂O(l) −285.8, CH₄ −74.6, O₂ 0.",
    ],
    solution: "[−393.5 + 2(−285.8)] − [−74.6 + 0] = −890.5 kJ/mol.",
    toolHref: "/reactions",
  },
  {
    id: "thermo-spontaneous",
    title: "Is the Haber process spontaneous?",
    topic: "Thermodynamics",
    difficulty: "Core",
    objectives: ["Judge spontaneity from the sign of ΔG"],
    prompt: "Is N₂ + 3H₂ → 2NH₃ spontaneous at 25 °C?",
    answer: { kind: "choice", options: ["Yes", "No"], correctIndex: haber.spontaneous ? 0 : 1 },
    hints: ["Compute ΔG = ΔH − TΔS at 298 K.", "ΔH ≈ −91.8 kJ/mol and ΔS ≈ −198 J/(mol·K)."],
    solution: `ΔG ≈ ${haber.dG.toFixed(0)} kJ/mol < 0, so it is spontaneous at 25 °C.`,
    toolHref: "/reactions",
  },
  {
    id: "kin-halflife",
    title: "First-order half-life",
    topic: "Kinetics",
    difficulty: "Core",
    objectives: ["Use the first-order half-life relation"],
    prompt: "A first-order reaction has k = 0.10 s⁻¹. What is its half-life?",
    answer: { kind: "numeric", value: halfLife(1, 0.1, 1), unit: "s", tolerance: 0.1 },
    hints: ["For first order, t½ = ln2 / k.", "ln2 ≈ 0.693."],
    solution: "t½ = 0.693 / 0.10 ≈ 6.93 s (independent of concentration).",
    toolHref: "/reactions",
  },
  {
    id: "kin-arrhenius",
    title: "Activation energy from two temperatures",
    topic: "Kinetics",
    difficulty: "Challenge",
    objectives: ["Apply the two-point Arrhenius equation"],
    prompt: "A reaction's rate constant doubles when the temperature rises from 27 °C to 37 °C. Estimate Eₐ.",
    answer: {
      kind: "numeric",
      value: activationEnergy(1, 27 + 273.15, 2, 37 + 273.15),
      unit: "kJ/mol",
      tolerance: 3,
    },
    hints: [
      "ln(k₂/k₁) = −Eₐ/R · (1/T₂ − 1/T₁).",
      "Use k₂/k₁ = 2, T₁ = 300.15 K, T₂ = 310.15 K, R = 8.314 J/(mol·K).",
    ],
    solution: "Solving gives Eₐ ≈ 54 kJ/mol.",
    toolHref: "/reactions",
  },
  {
    id: "gas-stp-volume",
    title: "Molar volume at STP",
    topic: "Gas Laws",
    difficulty: "Intro",
    objectives: ["Apply PV = nRT", "Recall the molar volume of a gas at STP"],
    prompt:
      "What volume does 1.00 mol of an ideal gas occupy at STP (P = 1.00 atm, T = 273.15 K)?",
    answer: {
      kind: "numeric",
      value: idealVal({ P: 1, n: 1, T: 273.15 }),
      unit: "L",
      tolerance: 0.1,
    },
    hints: [
      "Rearrange PV = nRT to V = nRT/P.",
      "Use R = 0.08206 L·atm·mol⁻¹·K⁻¹.",
    ],
    solution: "V = (1.00)(0.08206)(273.15) / 1.00 ≈ 22.41 L.",
    toolHref: "/reactions",
  },
  {
    id: "gas-charles",
    title: "Charles's law — heating a gas",
    topic: "Gas Laws",
    difficulty: "Core",
    objectives: ["Use the combined gas law at constant pressure"],
    prompt:
      "A 2.0 L sample of gas at 300 K is heated to 600 K at constant pressure. What is its new volume?",
    given: [
      { label: "V₁", value: "2.0 L" },
      { label: "T₁ → T₂", value: "300 K → 600 K" },
    ],
    answer: {
      kind: "numeric",
      value: combinedVal({ P1: 1, V1: 2, T1: 300, P2: 1, T2: 600 }),
      unit: "L",
      tolerance: 0.05,
    },
    hints: [
      "At constant pressure, V₁/T₁ = V₂/T₂.",
      "V₂ = V₁ × T₂/T₁ = 2.0 × 600/300.",
    ],
    solution: "V₂ = 2.0 × (600 / 300) = 4.0 L.",
    toolHref: "/reactions",
  },
  {
    id: "gas-boyle",
    title: "Boyle's law — compressing a gas",
    topic: "Gas Laws",
    difficulty: "Core",
    objectives: ["Use the combined gas law at constant temperature"],
    prompt:
      "A gas occupies 4.0 L at 1.0 atm. Compressed to 1.0 L at constant temperature, what is its new pressure?",
    answer: {
      kind: "numeric",
      value: combinedVal({ P1: 1, V1: 4, T1: 300, V2: 1, T2: 300 }),
      unit: "atm",
      tolerance: 0.05,
    },
    hints: [
      "At constant temperature, P₁V₁ = P₂V₂.",
      "P₂ = P₁ × V₁/V₂ = 1.0 × 4.0/1.0.",
    ],
    solution: "P₂ = 1.0 × (4.0 / 1.0) = 4.0 atm.",
    toolHref: "/reactions",
  },
  {
    id: "enzyme-mm-rate",
    title: "Michaelis–Menten rate",
    topic: "Enzyme Kinetics",
    difficulty: "Core",
    objectives: ["Apply the Michaelis–Menten equation"],
    prompt:
      "An enzyme has Vmax = 100 µmol/min and Km = 5.0 mM. What is the reaction rate at [S] = 15 mM?",
    given: [
      { label: "Vmax", value: "100 µmol/min" },
      { label: "Km", value: "5.0 mM" },
      { label: "[S]", value: "15 mM" },
    ],
    answer: {
      kind: "numeric",
      value: michaelisMenten(100, 5, 15),
      unit: "µmol/min",
      tolerance: 0.5,
    },
    hints: [
      "v = Vmax·[S] / (Km + [S]).",
      "v = 100 × 15 / (5 + 15) = 1500 / 20.",
    ],
    solution: "v = 100 × 15 / (5 + 15) = 75 µmol/min.",
    toolHref: "/reactions",
  },
  {
    id: "enzyme-km-half",
    title: "The meaning of Km",
    topic: "Enzyme Kinetics",
    difficulty: "Intro",
    objectives: ["Interpret Km as the half-saturation constant"],
    prompt:
      "For an enzyme with Km = 4.0 mM, at what substrate concentration is the rate exactly half of Vmax?",
    answer: { kind: "numeric", value: 4.0, unit: "mM", tolerance: 0.01 },
    hints: [
      "Set v = ½·Vmax in the Michaelis–Menten equation and solve for [S].",
      "½ = [S] / (Km + [S]) ⟹ [S] = Km.",
    ],
    solution: "At v = ½Vmax, [S] = Km = 4.0 mM — that is what Km means.",
    toolHref: "/reactions",
  },
  {
    id: "enzyme-fraction",
    title: "Fraction of Vmax",
    topic: "Enzyme Kinetics",
    difficulty: "Core",
    objectives: ["Relate [S]/Km to the fraction of Vmax reached"],
    prompt:
      "At a substrate concentration equal to three times Km, what fraction of Vmax is the reaction rate?",
    answer: {
      kind: "numeric",
      value: rateFraction(1, 3),
      unit: "",
      tolerance: 0.01,
    },
    hints: ["v/Vmax = [S] / (Km + [S]).", "With [S] = 3·Km: 3 / (1 + 3)."],
    solution: "v/Vmax = 3/(1+3) = 0.75, i.e. 75 % of Vmax.",
    toolHref: "/reactions",
  },
  {
    id: "echem-daniell",
    title: "Standard cell potential",
    topic: "Electrochemistry",
    difficulty: "Core",
    objectives: ["Combine standard reduction potentials into E°cell"],
    prompt:
      "A galvanic cell pairs a Cu²⁺/Cu cathode (E° = +0.34 V) with a Zn²⁺/Zn anode (E° = −0.76 V). What is E°cell?",
    answer: {
      kind: "numeric",
      value: standardCellPotential(HALF_BY_ID.Cu.E0, HALF_BY_ID.Zn.E0),
      unit: "V",
      tolerance: 0.01,
    },
    hints: [
      "E°cell = E°(cathode) − E°(anode).",
      "E°cell = 0.34 − (−0.76).",
    ],
    solution: "E°cell = 0.34 − (−0.76) = 1.10 V.",
    toolHref: "/reactions",
  },
  {
    id: "echem-nernst",
    title: "Nernst equation",
    topic: "Electrochemistry",
    difficulty: "Challenge",
    objectives: ["Apply the Nernst equation away from standard conditions"],
    prompt:
      "For the Daniell cell (E° = 1.10 V, n = 2) at 25 °C, what is the cell potential when Q = 100?",
    answer: {
      kind: "numeric",
      value: nernst(1.1, 2, 100, 298.15),
      unit: "V",
      tolerance: 0.005,
    },
    hints: [
      "E = E° − (RT/nF)·ln Q; at 25 °C, that is E° − (0.0592/n)·log Q.",
      "E = 1.10 − (0.0592/2)·log(100).",
    ],
    solution: "E = 1.10 − (0.0592/2)(2) = 1.10 − 0.0592 ≈ 1.04 V.",
    toolHref: "/reactions",
  },
  {
    id: "echem-direction",
    title: "Which metal is the reducing agent?",
    topic: "Electrochemistry",
    difficulty: "Intro",
    objectives: ["Use reduction potentials to predict a spontaneous reaction"],
    prompt: "Which metal will spontaneously reduce Cu²⁺ to Cu — zinc or silver?",
    answer: {
      kind: "choice",
      options: ["Zinc", "Silver"],
      correctIndex: HALF_BY_ID.Zn.E0 < HALF_BY_ID.Cu.E0 ? 0 : 1,
    },
    hints: [
      "A metal reduces an ion only if its own reduction potential is lower.",
      "E°: Zn²⁺/Zn = −0.76 V, Ag⁺/Ag = +0.80 V, Cu²⁺/Cu = +0.34 V.",
    ],
    solution:
      "Zinc (E° = −0.76 V) sits below Cu²⁺/Cu (+0.34 V), so Zn is oxidized and reduces Cu²⁺. Silver is not.",
    toolHref: "/reactions",
  },
  {
    id: "equil-ksp-agcl",
    title: "Solubility from Ksp",
    topic: "Equilibrium",
    difficulty: "Core",
    objectives: ["Relate Ksp to molar solubility for a 1:1 salt"],
    prompt:
      "The Ksp of AgCl is 1.8×10⁻¹⁰. What is its molar solubility in pure water?",
    answer: {
      kind: "numeric",
      value: molarSolubility(1.8e-10, 1, 1),
      unit: "mol/L",
      tolerance: 1e-6,
    },
    hints: ["AgCl ⇌ Ag⁺ + Cl⁻, so Ksp = s².", "s = √Ksp."],
    solution: "s = √(1.8×10⁻¹⁰) ≈ 1.34×10⁻⁵ mol/L.",
    toolHref: "/reactions",
  },
  {
    id: "equil-ksp-caf2",
    title: "Solubility of a 1:2 salt",
    topic: "Equilibrium",
    difficulty: "Challenge",
    objectives: ["Handle stoichiometry inside a Ksp expression"],
    prompt: "The Ksp of CaF₂ is 3.9×10⁻¹¹. What is its molar solubility?",
    answer: {
      kind: "numeric",
      value: molarSolubility(3.9e-11, 1, 2),
      unit: "mol/L",
      tolerance: 1e-5,
    },
    hints: [
      "CaF₂ ⇌ Ca²⁺ + 2F⁻, so Ksp = (s)(2s)² = 4s³.",
      "s = ∛(Ksp / 4).",
    ],
    solution: "s = ∛(3.9×10⁻¹¹ / 4) ≈ 2.14×10⁻⁴ mol/L.",
    toolHref: "/reactions",
  },
  {
    id: "equil-lechatelier",
    title: "Maximizing ammonia yield",
    topic: "Equilibrium",
    difficulty: "Core",
    objectives: ["Apply Le Chatelier's principle to shift an equilibrium"],
    prompt:
      "For N₂ + 3H₂ ⇌ 2NH₃ (ΔH < 0), which single change increases the equilibrium yield of NH₃?",
    answer: {
      kind: "choice",
      options: [
        "Increase the pressure",
        "Increase the temperature",
        "Add a catalyst",
      ],
      correctIndex: 0,
    },
    hints: [
      "The product side has fewer moles of gas (2 vs 4).",
      "Heat is a product of an exothermic reaction; a catalyst changes rate, not position.",
    ],
    solution:
      "Higher pressure favors the side with fewer gas moles (products), raising NH₃ yield. Heating shifts an exothermic reaction back toward reactants, and a catalyst doesn't move the equilibrium position.",
    toolHref: "/reactions",
  },
  {
    id: "ph-buffer",
    title: "pH of an acetate buffer",
    topic: "pH",
    difficulty: "Core",
    objectives: ["Apply the Henderson–Hasselbalch equation"],
    prompt:
      "A buffer contains 0.20 mol acetic acid and 0.10 mol sodium acetate (pKa = 4.76). What is its pH?",
    answer: {
      kind: "numeric",
      value: bufferPH(4.76, 0.2, 0.1),
      unit: "",
      tolerance: 0.05,
    },
    hints: [
      "pH = pKa + log([A⁻]/[HA]).",
      "pH = 4.76 + log(0.10 / 0.20).",
    ],
    solution: "pH = 4.76 + log(0.10/0.20) = 4.76 − 0.30 = 4.46.",
    toolHref: "/reactions",
  },
  {
    id: "titration-redox-fe",
    title: "Iron by permanganate titration",
    topic: "Titration",
    difficulty: "Challenge",
    objectives: ["Use electron balance to find an analyte concentration"],
    prompt:
      "A 25.00 mL sample of Fe²⁺ reaches the equivalence point with 20.00 mL of 0.0200 M KMnO₄ (MnO₄⁻ + 5Fe²⁺ + 8H⁺ → Mn²⁺ + 5Fe³⁺ + 4H₂O). What is [Fe²⁺]?",
    given: [
      { label: "KMnO₄", value: "20.00 mL, 0.0200 M" },
      { label: "Fe²⁺ sample", value: "25.00 mL" },
    ],
    answer: {
      kind: "numeric",
      value: redoxTitrationConcentration({
        cTitrant: 0.02,
        vTitrant: 20,
        nTitrant: 5,
        vAnalyte: 25,
        nAnalyte: 1,
      }),
      unit: "mol/L",
      tolerance: 0.001,
    },
    hints: [
      "Each MnO₄⁻ gains 5 e⁻; each Fe²⁺ loses 1 e⁻.",
      "5 × mol MnO₄⁻ = 1 × mol Fe²⁺.",
    ],
    solution:
      "mol MnO₄⁻ = 0.0200 × 0.02000 = 4.0×10⁻⁴; ×5 = 2.0×10⁻³ mol e⁻ = mol Fe²⁺. [Fe²⁺] = 2.0×10⁻³ / 0.02500 = 0.0800 M.",
    toolHref: "/reactions",
  },
  {
    id: "org-ethanol-fg",
    title: "Functional group of ethanol",
    topic: "Organic",
    difficulty: "Intro",
    objectives: ["Recognize a functional group from a 3D structure"],
    prompt: "Rotate the structure of ethanol. Which functional group does it contain?",
    moleculeKey: "ethanol",
    answer: {
      kind: "choice",
      options: ["Hydroxyl (–OH)", "Carbonyl (C=O)", "Carboxyl (–COOH)", "Amino (–NH₂)"],
      correctIndex: 0,
    },
    hints: [
      "Look for an oxygen bonded to both a carbon and a hydrogen.",
      "The –OH group defines an alcohol.",
    ],
    solution:
      "Ethanol (CH₃CH₂OH) contains a hydroxyl (–OH) group, making it an alcohol.",
    toolHref: "/molecules",
  },
  {
    id: "org-acetic-fg",
    title: "Functional group of acetic acid",
    topic: "Organic",
    difficulty: "Core",
    objectives: ["Distinguish a carboxyl group from other oxygen groups"],
    prompt: "Examine acetic acid. Which functional group is present?",
    moleculeKey: "acetic-acid",
    answer: {
      kind: "choice",
      options: ["Hydroxyl (–OH)", "Ketone (C=O)", "Carboxyl (–COOH)", "Ester (–COO–)"],
      correctIndex: 2,
    },
    hints: [
      "Find a carbon double-bonded to one oxygen and single-bonded to an –OH.",
      "That C(=O)–OH pattern is the carboxyl group.",
    ],
    solution:
      "Acetic acid (CH₃COOH) has a carboxyl (–COOH) group — the defining group of carboxylic acids.",
    toolHref: "/molecules",
  },
  {
    id: "org-acetone-fg",
    title: "Functional group of acetone",
    topic: "Organic",
    difficulty: "Core",
    objectives: ["Identify a ketone carbonyl"],
    prompt: "Acetone is shown. Which functional group does it contain?",
    moleculeKey: "acetone",
    answer: {
      kind: "choice",
      options: ["Aldehyde", "Ketone", "Carboxylic acid", "Alcohol"],
      correctIndex: 1,
    },
    hints: [
      "Locate the C=O carbon and see what is attached on each side.",
      "A carbonyl flanked by two carbons is a ketone.",
    ],
    solution:
      "Acetone ((CH₃)₂C=O) has a carbonyl carbon bonded to two other carbons — a ketone.",
    toolHref: "/molecules",
  },
  {
    id: "org-benzene-class",
    title: "Classify benzene",
    topic: "Organic",
    difficulty: "Intro",
    objectives: ["Recognize an aromatic ring"],
    prompt: "What class of hydrocarbon is the molecule shown (benzene)?",
    moleculeKey: "benzene",
    answer: {
      kind: "choice",
      options: ["Alkane", "Alkene", "Aromatic ring", "Alcohol"],
      correctIndex: 2,
    },
    hints: [
      "Note the flat six-membered carbon ring with delocalized bonding.",
      "C₆H₆ is the archetypal aromatic compound.",
    ],
    solution:
      "Benzene (C₆H₆) is a planar six-membered ring with delocalized π electrons — an aromatic hydrocarbon.",
    toolHref: "/molecules",
  },
  {
    id: "org-glucose-carbons",
    title: "Count the carbons in glucose",
    topic: "Organic",
    difficulty: "Intro",
    objectives: ["Read atom counts from a 3D structure"],
    prompt: "How many carbon atoms are in the glucose molecule shown?",
    moleculeKey: "glucose",
    answer: { kind: "numeric", value: 6, unit: "", tolerance: 0 },
    hints: ["Glucose is a hexose sugar.", "Its formula is C₆H₁₂O₆."],
    solution: "Glucose is C₆H₁₂O₆ — six carbon atoms.",
    toolHref: "/molecules",
  },
  {
    id: "bio-glucose-class",
    title: "Classify glucose",
    topic: "Biochemistry",
    difficulty: "Intro",
    objectives: ["Place a sugar in its biomolecule class"],
    prompt: "Glucose is shown. Which class of biomolecule does it belong to?",
    moleculeKey: "glucose",
    answer: {
      kind: "choice",
      options: ["Monosaccharide", "Amino acid", "Fatty acid", "Nucleotide"],
      correctIndex: 0,
    },
    hints: [
      "It is a single sugar unit, not a polymer.",
      "Simple sugars are monosaccharides.",
    ],
    solution:
      "Glucose is a single six-carbon sugar — a monosaccharide, the monomer of carbohydrates.",
    toolHref: "/molecules",
  },
  {
    id: "bio-caffeine",
    title: "Identify caffeine",
    topic: "Biochemistry",
    difficulty: "Core",
    objectives: ["Recognize a purine alkaloid"],
    prompt: "The molecule shown is caffeine. Which description fits it best?",
    moleculeKey: "caffeine",
    answer: {
      kind: "choice",
      options: ["Purine alkaloid (stimulant)", "Carbohydrate", "Lipid", "Protein"],
      correctIndex: 0,
    },
    hints: [
      "Note the fused nitrogen-containing double ring.",
      "Caffeine is built on the purine skeleton.",
    ],
    solution:
      "Caffeine is a purine alkaloid — a nitrogen-rich stimulant based on the fused purine ring system.",
    toolHref: "/molecules",
  },
  {
    id: "org-tollens",
    title: "Distinguish aldehyde from ketone",
    topic: "Organic",
    difficulty: "Core",
    objectives: ["Choose a test that separates aldehydes from ketones"],
    prompt:
      "Which reagent gives a silver mirror with an aldehyde but no reaction with a ketone?",
    answer: {
      kind: "choice",
      options: ["Tollens' reagent", "2,4-DNPH", "Bromine water", "Neutral FeCl₃"],
      correctIndex: 0,
    },
    hints: [
      "Both aldehydes and ketones react with 2,4-DNPH, so that can't tell them apart.",
      "Only aldehydes are reducing agents — they reduce Ag⁺ to a silver mirror.",
    ],
    solution:
      "Tollens' reagent (ammoniacal AgNO₃) is reduced by aldehydes to a silver mirror; ketones don't react.",
    toolHref: "/reactions",
  },
  {
    id: "org-bromine-test",
    title: "Test for a C=C double bond",
    topic: "Organic",
    difficulty: "Intro",
    objectives: ["Identify the qualitative test for unsaturation"],
    prompt: "What do you observe when bromine water is added to an alkene?",
    answer: {
      kind: "choice",
      options: [
        "Orange colour disappears",
        "Orange precipitate forms",
        "Silver mirror forms",
        "Violet colour appears",
      ],
      correctIndex: 0,
    },
    hints: [
      "Bromine adds across the C=C double bond.",
      "The orange Br₂ is consumed.",
    ],
    solution:
      "An alkene decolourises bromine water (orange → colourless) as Br₂ adds across the double bond.",
    toolHref: "/reactions",
  },
  {
    id: "org-carboxylic-test",
    title: "Identify a carboxylic acid",
    topic: "Organic",
    difficulty: "Core",
    objectives: ["Use a gas-evolution test for carboxylic acids"],
    prompt:
      "Which reagent fizzes (releases CO₂) with a carboxylic acid but not with an alcohol or phenol?",
    answer: {
      kind: "choice",
      options: [
        "Sodium hydrogencarbonate (NaHCO₃)",
        "Tollens' reagent",
        "2,4-DNPH",
        "Bromine water",
      ],
      correctIndex: 0,
    },
    hints: [
      "Only a strong enough acid protonates hydrogencarbonate.",
      "Alcohols and phenols are not acidic enough to release CO₂.",
    ],
    solution:
      "Carboxylic acids react with NaHCO₃ to give effervescence (CO₂); alcohols and phenols do not.",
    toolHref: "/reactions",
  },
];

export const TASK_TOPICS: TaskTopic[] = [
  "Balancing",
  "Stoichiometry",
  "pH",
  "Thermodynamics",
  "Kinetics",
  "Gas Laws",
  "Enzyme Kinetics",
  "Electrochemistry",
  "Equilibrium",
  "Titration",
  "Organic",
  "Biochemistry",
];
