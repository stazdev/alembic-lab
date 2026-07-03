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
import { pKaToKa, strongAcidPH, weakAcidPH } from "@/lib/chemistry/ph";
import { reactionThermo } from "@/lib/chemistry/thermo";
import { halfLife, activationEnergy } from "@/lib/chemistry/kinetics";
import { THERMO_BY_ID } from "@/data/thermoData";

export type TaskTopic =
  | "Balancing"
  | "Stoichiometry"
  | "pH"
  | "Thermodynamics"
  | "Kinetics";

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
];

export const TASK_TOPICS: TaskTopic[] = [
  "Balancing",
  "Stoichiometry",
  "pH",
  "Thermodynamics",
  "Kinetics",
];
