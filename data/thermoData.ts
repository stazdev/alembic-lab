/**
 * Standard thermodynamic data at 298.15 K (§2.1).
 *
 * ΔHf° in kJ/mol, S° in J/(mol·K). Elements in their standard state have
 * ΔHf° = 0 by definition. Versioned dataset — "data over code".
 */
export type Phase = "s" | "l" | "g" | "aq";

export interface ThermoSpecies {
  id: string; // e.g. "H2O(l)"
  formula: string; // e.g. "H2O"
  state: Phase;
  dHf: number; // kJ/mol
  s: number; // J/(mol·K)
}

export const THERMO_SPECIES: ThermoSpecies[] = [
  // Elements (ΔHf° = 0)
  { id: "H2(g)", formula: "H2", state: "g", dHf: 0, s: 130.7 },
  { id: "O2(g)", formula: "O2", state: "g", dHf: 0, s: 205.2 },
  { id: "N2(g)", formula: "N2", state: "g", dHf: 0, s: 191.6 },
  { id: "Cl2(g)", formula: "Cl2", state: "g", dHf: 0, s: 223.1 },
  { id: "C(s)", formula: "C", state: "s", dHf: 0, s: 5.7 },
  { id: "Na(s)", formula: "Na", state: "s", dHf: 0, s: 51.3 },
  { id: "Ca(s)", formula: "Ca", state: "s", dHf: 0, s: 41.6 },
  { id: "Fe(s)", formula: "Fe", state: "s", dHf: 0, s: 27.3 },
  { id: "Al(s)", formula: "Al", state: "s", dHf: 0, s: 28.3 },
  { id: "Mg(s)", formula: "Mg", state: "s", dHf: 0, s: 32.7 },

  // Oxides / water
  { id: "H2O(l)", formula: "H2O", state: "l", dHf: -285.8, s: 69.9 },
  { id: "H2O(g)", formula: "H2O", state: "g", dHf: -241.8, s: 188.8 },
  { id: "CO2(g)", formula: "CO2", state: "g", dHf: -393.5, s: 213.8 },
  { id: "CO(g)", formula: "CO", state: "g", dHf: -110.5, s: 197.7 },
  { id: "SO2(g)", formula: "SO2", state: "g", dHf: -296.8, s: 248.2 },
  { id: "SO3(g)", formula: "SO3", state: "g", dHf: -395.7, s: 256.8 },
  { id: "NO(g)", formula: "NO", state: "g", dHf: 91.3, s: 210.8 },
  { id: "NO2(g)", formula: "NO2", state: "g", dHf: 33.2, s: 240.1 },
  { id: "N2O4(g)", formula: "N2O4", state: "g", dHf: 11.1, s: 304.4 },
  { id: "CaO(s)", formula: "CaO", state: "s", dHf: -634.9, s: 38.1 },
  { id: "Fe2O3(s)", formula: "Fe2O3", state: "s", dHf: -824.2, s: 87.4 },
  { id: "Al2O3(s)", formula: "Al2O3", state: "s", dHf: -1675.7, s: 50.9 },
  { id: "MgO(s)", formula: "MgO", state: "s", dHf: -601.6, s: 27.0 },
  { id: "H2O2(l)", formula: "H2O2", state: "l", dHf: -187.8, s: 109.6 },

  // Hydrocarbons / organics
  { id: "CH4(g)", formula: "CH4", state: "g", dHf: -74.6, s: 186.3 },
  { id: "C2H4(g)", formula: "C2H4", state: "g", dHf: 52.4, s: 219.3 },
  { id: "C2H6(g)", formula: "C2H6", state: "g", dHf: -84.0, s: 229.2 },
  { id: "C3H8(g)", formula: "C3H8", state: "g", dHf: -104.7, s: 270.3 },
  { id: "CH3OH(l)", formula: "CH3OH", state: "l", dHf: -239.2, s: 126.8 },
  { id: "C2H5OH(l)", formula: "C2H5OH", state: "l", dHf: -277.6, s: 160.7 },
  { id: "C6H12O6(s)", formula: "C6H12O6", state: "s", dHf: -1273.3, s: 212.1 },

  // Acids / bases / salts
  { id: "NH3(g)", formula: "NH3", state: "g", dHf: -45.9, s: 192.8 },
  { id: "HCl(g)", formula: "HCl", state: "g", dHf: -92.3, s: 186.9 },
  { id: "H2SO4(l)", formula: "H2SO4", state: "l", dHf: -814.0, s: 156.9 },
  { id: "NaCl(s)", formula: "NaCl", state: "s", dHf: -411.2, s: 72.1 },
  { id: "NaOH(s)", formula: "NaOH", state: "s", dHf: -425.6, s: 64.5 },
  { id: "Na2CO3(s)", formula: "Na2CO3", state: "s", dHf: -1130.7, s: 135.0 },
  { id: "CaCO3(s)", formula: "CaCO3", state: "s", dHf: -1207.6, s: 91.7 },
  { id: "Ca(OH)2(s)", formula: "Ca(OH)2", state: "s", dHf: -985.2, s: 83.4 },
];

export const THERMO_BY_ID: Record<string, ThermoSpecies> = Object.fromEntries(
  THERMO_SPECIES.map((s) => [s.id, s]),
);
