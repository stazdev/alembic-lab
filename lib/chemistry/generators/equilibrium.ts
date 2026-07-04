/**
 * Equilibrium generators — molar solubility from Ksp (multiple choice, since the
 * answers are tiny exponentials) and a Le Chatelier direction predictor. Both
 * keyed by the verified equilibrium engine.
 */
import { molarSolubility, leChatelier, type Stress } from "@/lib/chemistry/equilibrium";
import { draw } from "./build";
import { sci } from "./format";
import type { TaskGenerator } from "./types";

// Non-1:1 salts only, so the "ignored stoichiometry" distractors genuinely differ
// from the correct solubility.
const SALTS = [
  { name: "CaF₂", x: 1, y: 2, ksp: 3.9e-11 },
  { name: "PbI₂", x: 1, y: 2, ksp: 7.1e-9 },
  { name: "Ag₂CrO₄", x: 2, y: 1, ksp: 1.1e-12 },
  { name: "Mg(OH)₂", x: 1, y: 2, ksp: 5.6e-12 },
  { name: "PbCl₂", x: 1, y: 2, ksp: 1.7e-5 },
];

export const solubilityGen: TaskGenerator = {
  id: "equil-solubility",
  topic: "Equilibrium",
  title: "Molar solubility",
  difficulties: ["Core", "Challenge"],
  build({ rng }) {
    const salt = draw(
      () => rng.pick(SALTS),
      (s) => {
        const val = molarSolubility(s.ksp, s.x, s.y);
        return Number.isFinite(val) && val > 0;
      },
    );
    const s = molarSolubility(salt.ksp, salt.x, salt.y);
    const correctStr = sci(s, 2);
    // Distractors from real mistakes.
    const cand = [
      Math.sqrt(salt.ksp), // assumed a 1:1 salt
      Math.pow(salt.ksp, 1 / (salt.x + salt.y)), // forgot the xˣyʸ factor
      salt.ksp, // reported Ksp itself as the solubility
    ];
    const wrong: string[] = [];
    for (const c of cand) {
      const cs = sci(c, 2);
      if (cs !== correctStr && !wrong.includes(cs)) wrong.push(cs);
    }
    const options = rng.shuffle([correctStr, ...wrong]);
    return {
      title: "Molar solubility",
      prompt: `The Ksp of ${salt.name} is ${sci(salt.ksp, 2)}. What is its molar solubility (mol/L)?`,
      given: [
        { label: "Salt", value: salt.name },
        { label: "Ksp", value: sci(salt.ksp, 2) },
      ],
      answer: { kind: "choice", options, correctIndex: options.indexOf(correctStr) },
      hints: [
        `Write the dissolution: ${salt.name} ⇌ ${salt.x > 1 ? salt.x : ""} cation + ${salt.y > 1 ? salt.y : ""} anion.`,
        "Ksp = (x·s)ˣ·(y·s)ʸ — solve for s, keeping the stoichiometric coefficients.",
      ],
      solution: `s = (Ksp / (xˣ·yʸ))^(1/(x+y)) = (${sci(salt.ksp, 2)} / ${Math.pow(salt.x, salt.x) * Math.pow(salt.y, salt.y)})^(1/${salt.x + salt.y}) = ${correctStr} mol/L.`,
      toolHref: "/reactions",
    };
  },
};

const EQUILIBRIA = [
  { eq: "N₂(g) + 3H₂(g) ⇌ 2NH₃(g)", deltaNgas: -2, exothermic: true },
  { eq: "2SO₂(g) + O₂(g) ⇌ 2SO₃(g)", deltaNgas: -1, exothermic: true },
  { eq: "N₂O₄(g) ⇌ 2NO₂(g)", deltaNgas: 1, exothermic: false },
  { eq: "H₂(g) + I₂(g) ⇌ 2HI(g)", deltaNgas: 0, exothermic: true },
  { eq: "CaCO₃(s) ⇌ CaO(s) + CO₂(g)", deltaNgas: 1, exothermic: false },
];

const STRESSES: { k: Stress; label: string }[] = [
  { k: "addReactant", label: "add more reactant" },
  { k: "removeProduct", label: "remove some product" },
  { k: "increasePressure", label: "increase the pressure" },
  { k: "decreasePressure", label: "decrease the pressure" },
  { k: "increaseTemp", label: "raise the temperature" },
  { k: "decreaseTemp", label: "lower the temperature" },
  { k: "catalyst", label: "add a catalyst" },
];

const SHIFT_OPTIONS = ["Shifts left (toward reactants)", "Shifts right (toward products)", "No change"];
const SHIFT_INDEX = { left: 0, right: 1, none: 2 } as const;

export const leChatelierGen: TaskGenerator = {
  id: "equil-le-chatelier",
  topic: "Equilibrium",
  title: "Le Chatelier's principle",
  difficulties: ["Core"],
  build({ rng }) {
    const { eqm, stress } = draw(
      () => ({ eqm: rng.pick(EQUILIBRIA), stress: rng.pick(STRESSES) }),
      () => true,
    );
    const { shift, reason } = leChatelier(
      { deltaNgas: eqm.deltaNgas, exothermic: eqm.exothermic },
      stress.k,
    );
    return {
      title: "Le Chatelier's principle",
      prompt: `For the equilibrium ${eqm.eq} (${eqm.exothermic ? "exothermic" : "endothermic"} forward), what happens if you ${stress.label}?`,
      given: [
        { label: "Equilibrium", value: eqm.eq },
        { label: "Forward reaction", value: eqm.exothermic ? "exothermic" : "endothermic" },
        { label: "Stress", value: stress.label },
      ],
      answer: { kind: "choice", options: SHIFT_OPTIONS, correctIndex: SHIFT_INDEX[shift] },
      hints: [
        "Le Chatelier: the system shifts to oppose the applied change.",
        "For pressure, compare moles of gas on each side; for temperature, treat heat as a reactant (endothermic) or product (exothermic).",
      ],
      solution: reason,
      toolHref: "/reactions",
    };
  },
};
