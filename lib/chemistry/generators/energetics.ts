/**
 * Thermodynamics generators — Hess-law ΔH°rxn over standard formation data,
 * Gibbs free energy ΔG = ΔH − TΔS, and calorimetry q = mcΔT. Answers come from
 * the verified thermo engine and its dataset.
 */
import { reactionThermo, gibbs, heat, type ThermoTerm } from "@/lib/chemistry/thermo";
import { THERMO_BY_ID } from "@/data/thermoData";
import { draw } from "./build";
import { sigTolerance, fmt } from "./format";
import type { TaskGenerator } from "./types";

// Curated balanced reactions whose every species is in THERMO_BY_ID.
const REACTIONS: {
  eq: string;
  r: [string, number][];
  p: [string, number][];
}[] = [
  { eq: "CH₄(g) + 2O₂(g) → CO₂(g) + 2H₂O(l)", r: [["CH4(g)", 1], ["O2(g)", 2]], p: [["CO2(g)", 1], ["H2O(l)", 2]] },
  { eq: "2H₂(g) + O₂(g) → 2H₂O(l)", r: [["H2(g)", 2], ["O2(g)", 1]], p: [["H2O(l)", 2]] },
  { eq: "N₂(g) + 3H₂(g) → 2NH₃(g)", r: [["N2(g)", 1], ["H2(g)", 3]], p: [["NH3(g)", 2]] },
  { eq: "2SO₂(g) + O₂(g) → 2SO₃(g)", r: [["SO2(g)", 2], ["O2(g)", 1]], p: [["SO3(g)", 2]] },
  { eq: "N₂O₄(g) → 2NO₂(g)", r: [["N2O4(g)", 1]], p: [["NO2(g)", 2]] },
  { eq: "4Fe(s) + 3O₂(g) → 2Fe₂O₃(s)", r: [["Fe(s)", 4], ["O2(g)", 3]], p: [["Fe2O3(s)", 2]] },
  { eq: "2Al(s) + Fe₂O₃(s) → Al₂O₃(s) + 2Fe(s)", r: [["Al(s)", 2], ["Fe2O3(s)", 1]], p: [["Al2O3(s)", 1], ["Fe(s)", 2]] },
  { eq: "CaCO₃(s) → CaO(s) + CO₂(g)", r: [["CaCO3(s)", 1]], p: [["CaO(s)", 1], ["CO2(g)", 1]] },
  { eq: "C₂H₅OH(l) + 3O₂(g) → 2CO₂(g) + 3H₂O(l)", r: [["C2H5OH(l)", 1], ["O2(g)", 3]], p: [["CO2(g)", 2], ["H2O(l)", 3]] },
  { eq: "C₆H₁₂O₆(s) + 6O₂(g) → 6CO₂(g) + 6H₂O(l)", r: [["C6H12O6(s)", 1], ["O2(g)", 6]], p: [["CO2(g)", 6], ["H2O(l)", 6]] },
];

const term = ([id, coeff]: [string, number]): ThermoTerm => {
  const s = THERMO_BY_ID[id];
  return { dHf: s.dHf, s: s.s, coeff };
};

export const hessEnthalpyGen: TaskGenerator = {
  id: "thermo-hess-dh",
  topic: "Thermodynamics",
  title: "Enthalpy of reaction (Hess)",
  difficulties: ["Core", "Challenge"],
  build({ rng }) {
    const rxn = draw(
      () => rng.pick(REACTIONS),
      () => true,
    );
    const res = reactionThermo(rxn.r.map(term), rxn.p.map(term));
    const dH = res.dH;
    return {
      title: "Enthalpy of reaction",
      prompt: `Using standard enthalpies of formation, calculate ΔH°rxn (kJ) for:  ${rxn.eq}`,
      given: [{ label: "Reaction", value: rxn.eq }],
      answer: { kind: "numeric", value: dH, unit: "kJ", tolerance: sigTolerance(dH, 1) },
      hints: [
        "ΔH°rxn = ΣΔHf°(products) − ΣΔHf°(reactants).",
        "Weight each formation enthalpy by its coefficient; elements in their standard state have ΔHf° = 0.",
      ],
      solution: `ΔH°rxn = ΣΔHf°(products) − ΣΔHf°(reactants) = ${fmt(dH, 1)} kJ (${dH < 0 ? "exothermic" : "endothermic"}).`,
      toolHref: "/reactions",
    };
  },
};

export const gibbsGen: TaskGenerator = {
  id: "thermo-gibbs",
  topic: "Thermodynamics",
  title: "Gibbs free energy",
  difficulties: ["Core"],
  build({ rng }) {
    const p = draw(
      () => ({
        dH: rng.float(-250, 250, 0), // kJ/mol
        dS: rng.float(-300, 300, 0), // J/(mol·K)
        T: rng.int(250, 500),
      }),
      ({ dH, dS, T }) => Math.abs(gibbs(dH, dS, T)) > 5, // avoid a near-zero answer
    );
    const dG = gibbs(p.dH, p.dS, p.T);
    return {
      title: "Gibbs free energy",
      prompt: `A reaction has ΔH = ${fmt(p.dH, 0)} kJ/mol and ΔS = ${fmt(p.dS, 0)} J/(mol·K). Calculate ΔG (kJ/mol) at ${p.T} K.`,
      given: [
        { label: "ΔH", value: `${fmt(p.dH, 0)} kJ/mol` },
        { label: "ΔS", value: `${fmt(p.dS, 0)} J/(mol·K)` },
        { label: "T", value: `${p.T} K` },
      ],
      answer: { kind: "numeric", value: dG, unit: "kJ/mol", tolerance: sigTolerance(dG, 1) },
      hints: [
        "ΔG = ΔH − TΔS.",
        "Watch the units — ΔS is in J, ΔH in kJ, so divide ΔS by 1000 (or convert ΔH).",
      ],
      solution: `ΔG = ΔH − TΔS = ${fmt(p.dH, 0)} − ${p.T}×(${fmt(p.dS, 0)}/1000) = ${fmt(dG, 1)} kJ/mol (${dG < 0 ? "spontaneous" : "non-spontaneous"}).`,
      toolHref: "/reactions",
    };
  },
};

const SUBSTANCES = [
  { name: "water", c: 4.18 },
  { name: "aluminium", c: 0.9 },
  { name: "copper", c: 0.385 },
  { name: "iron", c: 0.449 },
  { name: "ethanol", c: 2.44 },
];

export const calorimetryGen: TaskGenerator = {
  id: "thermo-calorimetry",
  topic: "Thermodynamics",
  title: "Calorimetry",
  difficulties: ["Intro", "Core"],
  build({ rng }) {
    const p = draw(
      () => ({
        sub: rng.pick(SUBSTANCES),
        m: rng.float(10, 500, 0),
        dT: rng.float(5, 80, 1),
      }),
      () => true,
    );
    const q = heat(p.m, p.sub.c, p.dT); // joules
    return {
      title: "Calorimetry",
      prompt: `How much heat (J) is required to raise the temperature of ${fmt(p.m, 0)} g of ${p.sub.name} by ${fmt(p.dT, 1)} °C?  (c = ${p.sub.c} J·g⁻¹·°C⁻¹)`,
      given: [
        { label: "Mass", value: `${fmt(p.m, 0)} g ${p.sub.name}` },
        { label: "Specific heat", value: `${p.sub.c} J·g⁻¹·°C⁻¹` },
        { label: "ΔT", value: `${fmt(p.dT, 1)} °C` },
      ],
      answer: { kind: "numeric", value: q, unit: "J", tolerance: sigTolerance(q, 0) },
      hints: ["Use q = m·c·ΔT.", "Mass in grams, c in J·g⁻¹·°C⁻¹, ΔT in °C give q in joules."],
      solution: `q = m·c·ΔT = ${fmt(p.m, 0)} × ${p.sub.c} × ${fmt(p.dT, 1)} = ${fmt(q, 0)} J`,
      toolHref: "/reactions",
    };
  },
};
