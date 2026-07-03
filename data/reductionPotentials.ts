/**
 * Standard reduction potentials (deferred Module 2 · Electrochemistry).
 * E° in volts vs the standard hydrogen electrode (SHE) at 25 °C, 1 M / 1 atm.
 * "Data over code" — the versioned table the electrochemistry engine reads.
 */
export interface HalfReaction {
  id: string;
  half: string; // full reduction half-reaction (display, with unicode)
  oxidized: string; // oxidized-form species of the couple
  reduced: string; // reduced-form species
  n: number; // electrons transferred
  E0: number; // standard reduction potential, V
}

export const REDUCTION_POTENTIALS: HalfReaction[] = [
  { id: "F2", half: "F₂ + 2e⁻ → 2F⁻", oxidized: "F₂", reduced: "F⁻", n: 2, E0: 2.87 },
  { id: "MnO4", half: "MnO₄⁻ + 8H⁺ + 5e⁻ → Mn²⁺ + 4H₂O", oxidized: "MnO₄⁻", reduced: "Mn²⁺", n: 5, E0: 1.51 },
  { id: "Cl2", half: "Cl₂ + 2e⁻ → 2Cl⁻", oxidized: "Cl₂", reduced: "Cl⁻", n: 2, E0: 1.36 },
  { id: "Cr2O7", half: "Cr₂O₇²⁻ + 14H⁺ + 6e⁻ → 2Cr³⁺ + 7H₂O", oxidized: "Cr₂O₇²⁻", reduced: "Cr³⁺", n: 6, E0: 1.33 },
  { id: "O2", half: "O₂ + 4H⁺ + 4e⁻ → 2H₂O", oxidized: "O₂", reduced: "H₂O", n: 4, E0: 1.23 },
  { id: "Br2", half: "Br₂ + 2e⁻ → 2Br⁻", oxidized: "Br₂", reduced: "Br⁻", n: 2, E0: 1.07 },
  { id: "Ag", half: "Ag⁺ + e⁻ → Ag", oxidized: "Ag⁺", reduced: "Ag", n: 1, E0: 0.8 },
  { id: "Fe3", half: "Fe³⁺ + e⁻ → Fe²⁺", oxidized: "Fe³⁺", reduced: "Fe²⁺", n: 1, E0: 0.77 },
  { id: "I2", half: "I₂ + 2e⁻ → 2I⁻", oxidized: "I₂", reduced: "I⁻", n: 2, E0: 0.54 },
  { id: "Cu", half: "Cu²⁺ + 2e⁻ → Cu", oxidized: "Cu²⁺", reduced: "Cu", n: 2, E0: 0.34 },
  { id: "H", half: "2H⁺ + 2e⁻ → H₂", oxidized: "H⁺", reduced: "H₂", n: 2, E0: 0.0 },
  { id: "Pb", half: "Pb²⁺ + 2e⁻ → Pb", oxidized: "Pb²⁺", reduced: "Pb", n: 2, E0: -0.13 },
  { id: "Sn", half: "Sn²⁺ + 2e⁻ → Sn", oxidized: "Sn²⁺", reduced: "Sn", n: 2, E0: -0.14 },
  { id: "Ni", half: "Ni²⁺ + 2e⁻ → Ni", oxidized: "Ni²⁺", reduced: "Ni", n: 2, E0: -0.25 },
  { id: "Co", half: "Co²⁺ + 2e⁻ → Co", oxidized: "Co²⁺", reduced: "Co", n: 2, E0: -0.28 },
  { id: "Fe", half: "Fe²⁺ + 2e⁻ → Fe", oxidized: "Fe²⁺", reduced: "Fe", n: 2, E0: -0.44 },
  { id: "Cr", half: "Cr³⁺ + 3e⁻ → Cr", oxidized: "Cr³⁺", reduced: "Cr", n: 3, E0: -0.74 },
  { id: "Zn", half: "Zn²⁺ + 2e⁻ → Zn", oxidized: "Zn²⁺", reduced: "Zn", n: 2, E0: -0.76 },
  { id: "Mn", half: "Mn²⁺ + 2e⁻ → Mn", oxidized: "Mn²⁺", reduced: "Mn", n: 2, E0: -1.18 },
  { id: "Al", half: "Al³⁺ + 3e⁻ → Al", oxidized: "Al³⁺", reduced: "Al", n: 3, E0: -1.66 },
  { id: "Mg", half: "Mg²⁺ + 2e⁻ → Mg", oxidized: "Mg²⁺", reduced: "Mg", n: 2, E0: -2.37 },
  { id: "Na", half: "Na⁺ + e⁻ → Na", oxidized: "Na⁺", reduced: "Na", n: 1, E0: -2.71 },
  { id: "Ca", half: "Ca²⁺ + 2e⁻ → Ca", oxidized: "Ca²⁺", reduced: "Ca", n: 2, E0: -2.87 },
  { id: "K", half: "K⁺ + e⁻ → K", oxidized: "K⁺", reduced: "K", n: 1, E0: -2.93 },
  { id: "Li", half: "Li⁺ + e⁻ → Li", oxidized: "Li⁺", reduced: "Li", n: 1, E0: -3.04 },
];

export const HALF_BY_ID: Record<string, HalfReaction> = Object.fromEntries(
  REDUCTION_POTENTIALS.map((h) => [h.id, h]),
);
