/**
 * Stoichiometry generators. G0 ships the molar-mass generator as the end-to-end
 * proof of the kernel; G1 adds moles↔mass↔molarity, dilution, and limiting
 * reagent against the same engines.
 */
import { molarMass } from "@/lib/chemistry/stoichiometry";
import { draw } from "./build";
import { sigTolerance, fmt } from "./format";
import type { TaskGenerator } from "./types";

// Real formulas the molarMass engine parses cleanly. Intro = simpler species.
const INTRO_POOL = ["H2O", "CO2", "NaCl", "O2", "NH3", "CH4", "HCl", "CaO"];
const CORE_POOL = [
  "H2SO4", "CaCO3", "C6H12O6", "KMnO4", "Fe2O3", "Ca(OH)2",
  "MgCl2", "C2H5OH", "Al2(SO4)3", "NaHCO3", "K2Cr2O7", "CuSO4",
];

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

    // Guard guarantees ok; compute the answer from the verified engine.
    const res = molarMass(formula);
    if (!res.ok) throw new Error(res.error);
    const { molarMass: mm, parts } = res.value;

    const phrasings = [
      (f: string) => `Calculate the molar mass of ${f} (g/mol).`,
      (f: string) => `What is the molar mass of ${f}, in g/mol?`,
      (f: string) => `Find the molar mass (g/mol) of ${f}.`,
    ];

    const workedSum = parts
      .map((p) => `${p.count}×${p.element}(${p.atomicMass.toFixed(3)}) = ${p.subtotal.toFixed(3)}`)
      .join("  +  ");

    return {
      title: "Molar mass",
      prompt: rng.pick(phrasings)(formula),
      given: [{ label: "Formula", value: formula }],
      answer: {
        kind: "numeric",
        value: mm,
        unit: "g/mol",
        tolerance: sigTolerance(mm, 2),
      },
      hints: [
        "Add up the atomic mass of every atom in the formula.",
        `Break it down by element: ${parts
          .map((p) => `${p.count}×${p.element}`)
          .join(", ")}.`,
      ],
      solution: `${workedSum}  =  ${fmt(mm, 2)} g/mol`,
      toolHref: "/reactions",
    };
  },
};
