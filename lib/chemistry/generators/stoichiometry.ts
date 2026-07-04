/**
 * Stoichiometry generators — molar mass, dilution (C₁V₁=C₂V₂), and molarity
 * from a dissolved mass. Answers come from the verified stoichiometry engine.
 */
import {
  molarMass,
  molesFromMass,
  molarity,
  solveDilution,
} from "@/lib/chemistry/stoichiometry";
import { draw } from "./build";
import { sigTolerance, fmt } from "./format";
import type { TaskGenerator } from "./types";

const INTRO_POOL = ["H2O", "CO2", "NaCl", "O2", "NH3", "CH4", "HCl", "CaO"];
const CORE_POOL = [
  "H2SO4", "CaCO3", "C6H12O6", "KMnO4", "Fe2O3", "Ca(OH)2",
  "MgCl2", "C2H5OH", "Al2(SO4)3", "NaHCO3", "K2Cr2O7", "CuSO4",
];
const SOLUBLE = ["NaCl", "KNO3", "CuSO4", "NaOH", "KOH", "Na2CO3", "KCl", "MgCl2", "CaCl2", "C6H12O6"];

export const molarMassGen: TaskGenerator = {
  id: "stoich-molar-mass",
  topic: "Stoichiometry",
  title: "Molar mass",
  difficulties: ["Intro", "Core"],
  build({ rng, difficulty }) {
    const pool = difficulty === "Intro" ? INTRO_POOL : CORE_POOL;
    const formula = draw(
      () => rng.pick(pool),
      (f) => {
        const r = molarMass(f);
        return r.ok && Number.isFinite(r.value.molarMass) && r.value.molarMass > 0;
      },
    );
    const res = molarMass(formula);
    if (!res.ok) throw new Error(res.error);
    const { molarMass: mm, parts } = res.value;
    const phrasings = [
      (f: string) => `Calculate the molar mass of ${f} (g/mol).`,
      (f: string) => `What is the molar mass of ${f}, in g/mol?`,
      (f: string) => `Find the molar mass (g/mol) of ${f}.`,
    ];
    return {
      title: "Molar mass",
      prompt: rng.pick(phrasings)(formula),
      given: [{ label: "Formula", value: formula }],
      answer: { kind: "numeric", value: mm, unit: "g/mol", tolerance: sigTolerance(mm, 2) },
      hints: [
        "Add up the atomic mass of every atom in the formula.",
        `Break it down by element: ${parts.map((p) => `${p.count}×${p.element}`).join(", ")}.`,
      ],
      solution:
        parts
          .map((p) => `${p.count}×${p.element}(${p.atomicMass.toFixed(3)}) = ${p.subtotal.toFixed(3)}`)
          .join("  +  ") + `  =  ${fmt(mm, 2)} g/mol`,
      toolHref: "/reactions",
    };
  },
};

export const dilutionGen: TaskGenerator = {
  id: "stoich-dilution",
  topic: "Stoichiometry",
  title: "Dilution",
  difficulties: ["Core"],
  build({ rng }) {
    const p = draw(
      () => {
        const c1 = rng.float(1, 6, 1); // stock
        const c2 = rng.float(0.05, 0.8, 2); // diluted
        const v2 = rng.int(50, 500); // final volume, mL
        return { c1, c2, v2 };
      },
      ({ c1, c2, v2 }) => {
        if (c2 >= c1) return false;
        const v1 = (c2 * v2) / c1;
        return v1 >= 2 && v1 <= v2; // measurable, and genuinely a dilution
      },
    );
    const res = solveDilution(p.c1, null, p.c2, p.v2);
    if (!res.ok) throw new Error(res.error);
    const v1 = res.value.v1;
    return {
      title: "Dilution",
      prompt: `How many mL of ${fmt(p.c1, 1)} M stock solution are needed to prepare ${p.v2} mL of ${fmt(p.c2, 2)} M solution?`,
      given: [
        { label: "C₁ (stock)", value: `${fmt(p.c1, 1)} M` },
        { label: "C₂ (final)", value: `${fmt(p.c2, 2)} M` },
        { label: "V₂ (final)", value: `${p.v2} mL` },
      ],
      answer: { kind: "numeric", value: v1, unit: "mL", tolerance: sigTolerance(v1, 1) },
      hints: [
        "Use C₁V₁ = C₂V₂ — moles of solute are conserved on dilution.",
        "Solve for V₁ = C₂·V₂ / C₁.",
      ],
      solution: `V₁ = C₂·V₂ / C₁ = (${fmt(p.c2, 2)} × ${p.v2}) / ${fmt(p.c1, 1)} = ${fmt(v1, 1)} mL`,
      toolHref: "/reactions",
    };
  },
};

export const molarityGen: TaskGenerator = {
  id: "stoich-molarity",
  topic: "Stoichiometry",
  title: "Molarity",
  difficulties: ["Core"],
  build({ rng }) {
    const p = draw(
      () => ({
        formula: rng.pick(SOLUBLE),
        grams: rng.float(5, 60, 1),
        volL: rng.float(0.1, 1, 2),
      }),
      ({ formula, grams, volL }) => {
        const r = molarMass(formula);
        if (!r.ok) return false;
        const c = molarity(molesFromMass(grams, r.value.molarMass), volL);
        return c >= 0.05 && c <= 5;
      },
    );
    const mm = molarMass(p.formula);
    if (!mm.ok) throw new Error(mm.error);
    const moles = molesFromMass(p.grams, mm.value.molarMass);
    const c = molarity(moles, p.volL);
    return {
      title: "Molarity",
      prompt: `${fmt(p.grams, 1)} g of ${p.formula} is dissolved in enough water to make ${fmt(p.volL, 2)} L of solution. What is its molarity (mol/L)?`,
      given: [
        { label: "Mass", value: `${fmt(p.grams, 1)} g ${p.formula}` },
        { label: "Volume", value: `${fmt(p.volL, 2)} L` },
      ],
      answer: { kind: "numeric", value: c, unit: "mol/L", tolerance: sigTolerance(c, 3) },
      hints: [
        "First convert grams to moles: n = m / M.",
        "Then molarity C = n / V (volume in litres).",
      ],
      solution: `M(${p.formula}) = ${fmt(mm.value.molarMass, 2)} g/mol; n = ${fmt(p.grams, 1)}/${fmt(mm.value.molarMass, 2)} = ${fmt(moles, 3)} mol; C = ${fmt(moles, 3)}/${fmt(p.volL, 2)} = ${fmt(c, 3)} mol/L`,
      toolHref: "/reactions",
    };
  },
};
