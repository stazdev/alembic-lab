/**
 * Periodic-table element dataset (Module 3 · §3.1).
 *
 * "Data over code" — one record per element, rich enough to drive the faithful
 * IUPAC grid, category coloring, and (once enriched) trends + atomic models.
 * Masses are NOT duplicated here: they come from the shared, verified
 * ATOMIC_MASS table so there is a single source of truth.
 *
 * Layout convention: `group` (1–18) and `period` (1–7) place every main/d-block
 * element directly onto an 18-column CSS grid. Lanthanides (57–71) and actinides
 * (89–103) carry the nominal group 3 but are routed into the f-block strip by the
 * renderer (see `isFBlock`), with placeholder markers left at the La/Ac cells.
 */
import { ATOMIC_MASS } from "./atomicMasses";
import { ELEMENT_PROPERTIES, type ElementProperties } from "./elementProperties";

export type { ElementProperties };

export type ElementCategory =
  | "alkali-metal"
  | "alkaline-earth-metal"
  | "transition-metal"
  | "post-transition-metal"
  | "metalloid"
  | "nonmetal"
  | "halogen"
  | "noble-gas"
  | "lanthanide"
  | "actinide"
  | "unknown";

export type Block = "s" | "p" | "d" | "f";

export interface ElementDatum extends ElementProperties {
  z: number; // atomic number
  symbol: string;
  name: string;
  category: ElementCategory;
  group: number; // IUPAC 1–18 (f-block carries nominal 3, rendered in the strip)
  period: number; // 1–7
  block: Block;
  mass: number; // g/mol, from the shared ATOMIC_MASS table
  // ...plus electronegativity / atomicRadius / ionizationEnergy / meltingPoint /
  // boilingPoint / density / standardState, merged from ELEMENT_PROPERTIES.
}

// [z, symbol, name, category, group, period, block]
type Row = [number, string, string, ElementCategory, number, number, Block];

const ROWS: Row[] = [
  [1, "H", "Hydrogen", "nonmetal", 1, 1, "s"],
  [2, "He", "Helium", "noble-gas", 18, 1, "s"],
  [3, "Li", "Lithium", "alkali-metal", 1, 2, "s"],
  [4, "Be", "Beryllium", "alkaline-earth-metal", 2, 2, "s"],
  [5, "B", "Boron", "metalloid", 13, 2, "p"],
  [6, "C", "Carbon", "nonmetal", 14, 2, "p"],
  [7, "N", "Nitrogen", "nonmetal", 15, 2, "p"],
  [8, "O", "Oxygen", "nonmetal", 16, 2, "p"],
  [9, "F", "Fluorine", "halogen", 17, 2, "p"],
  [10, "Ne", "Neon", "noble-gas", 18, 2, "p"],
  [11, "Na", "Sodium", "alkali-metal", 1, 3, "s"],
  [12, "Mg", "Magnesium", "alkaline-earth-metal", 2, 3, "s"],
  [13, "Al", "Aluminium", "post-transition-metal", 13, 3, "p"],
  [14, "Si", "Silicon", "metalloid", 14, 3, "p"],
  [15, "P", "Phosphorus", "nonmetal", 15, 3, "p"],
  [16, "S", "Sulfur", "nonmetal", 16, 3, "p"],
  [17, "Cl", "Chlorine", "halogen", 17, 3, "p"],
  [18, "Ar", "Argon", "noble-gas", 18, 3, "p"],
  [19, "K", "Potassium", "alkali-metal", 1, 4, "s"],
  [20, "Ca", "Calcium", "alkaline-earth-metal", 2, 4, "s"],
  [21, "Sc", "Scandium", "transition-metal", 3, 4, "d"],
  [22, "Ti", "Titanium", "transition-metal", 4, 4, "d"],
  [23, "V", "Vanadium", "transition-metal", 5, 4, "d"],
  [24, "Cr", "Chromium", "transition-metal", 6, 4, "d"],
  [25, "Mn", "Manganese", "transition-metal", 7, 4, "d"],
  [26, "Fe", "Iron", "transition-metal", 8, 4, "d"],
  [27, "Co", "Cobalt", "transition-metal", 9, 4, "d"],
  [28, "Ni", "Nickel", "transition-metal", 10, 4, "d"],
  [29, "Cu", "Copper", "transition-metal", 11, 4, "d"],
  [30, "Zn", "Zinc", "transition-metal", 12, 4, "d"],
  [31, "Ga", "Gallium", "post-transition-metal", 13, 4, "p"],
  [32, "Ge", "Germanium", "metalloid", 14, 4, "p"],
  [33, "As", "Arsenic", "metalloid", 15, 4, "p"],
  [34, "Se", "Selenium", "nonmetal", 16, 4, "p"],
  [35, "Br", "Bromine", "halogen", 17, 4, "p"],
  [36, "Kr", "Krypton", "noble-gas", 18, 4, "p"],
  [37, "Rb", "Rubidium", "alkali-metal", 1, 5, "s"],
  [38, "Sr", "Strontium", "alkaline-earth-metal", 2, 5, "s"],
  [39, "Y", "Yttrium", "transition-metal", 3, 5, "d"],
  [40, "Zr", "Zirconium", "transition-metal", 4, 5, "d"],
  [41, "Nb", "Niobium", "transition-metal", 5, 5, "d"],
  [42, "Mo", "Molybdenum", "transition-metal", 6, 5, "d"],
  [43, "Tc", "Technetium", "transition-metal", 7, 5, "d"],
  [44, "Ru", "Ruthenium", "transition-metal", 8, 5, "d"],
  [45, "Rh", "Rhodium", "transition-metal", 9, 5, "d"],
  [46, "Pd", "Palladium", "transition-metal", 10, 5, "d"],
  [47, "Ag", "Silver", "transition-metal", 11, 5, "d"],
  [48, "Cd", "Cadmium", "transition-metal", 12, 5, "d"],
  [49, "In", "Indium", "post-transition-metal", 13, 5, "p"],
  [50, "Sn", "Tin", "post-transition-metal", 14, 5, "p"],
  [51, "Sb", "Antimony", "metalloid", 15, 5, "p"],
  [52, "Te", "Tellurium", "metalloid", 16, 5, "p"],
  [53, "I", "Iodine", "halogen", 17, 5, "p"],
  [54, "Xe", "Xenon", "noble-gas", 18, 5, "p"],
  [55, "Cs", "Caesium", "alkali-metal", 1, 6, "s"],
  [56, "Ba", "Barium", "alkaline-earth-metal", 2, 6, "s"],
  [57, "La", "Lanthanum", "lanthanide", 3, 6, "f"],
  [58, "Ce", "Cerium", "lanthanide", 3, 6, "f"],
  [59, "Pr", "Praseodymium", "lanthanide", 3, 6, "f"],
  [60, "Nd", "Neodymium", "lanthanide", 3, 6, "f"],
  [61, "Pm", "Promethium", "lanthanide", 3, 6, "f"],
  [62, "Sm", "Samarium", "lanthanide", 3, 6, "f"],
  [63, "Eu", "Europium", "lanthanide", 3, 6, "f"],
  [64, "Gd", "Gadolinium", "lanthanide", 3, 6, "f"],
  [65, "Tb", "Terbium", "lanthanide", 3, 6, "f"],
  [66, "Dy", "Dysprosium", "lanthanide", 3, 6, "f"],
  [67, "Ho", "Holmium", "lanthanide", 3, 6, "f"],
  [68, "Er", "Erbium", "lanthanide", 3, 6, "f"],
  [69, "Tm", "Thulium", "lanthanide", 3, 6, "f"],
  [70, "Yb", "Ytterbium", "lanthanide", 3, 6, "f"],
  [71, "Lu", "Lutetium", "lanthanide", 3, 6, "f"],
  [72, "Hf", "Hafnium", "transition-metal", 4, 6, "d"],
  [73, "Ta", "Tantalum", "transition-metal", 5, 6, "d"],
  [74, "W", "Tungsten", "transition-metal", 6, 6, "d"],
  [75, "Re", "Rhenium", "transition-metal", 7, 6, "d"],
  [76, "Os", "Osmium", "transition-metal", 8, 6, "d"],
  [77, "Ir", "Iridium", "transition-metal", 9, 6, "d"],
  [78, "Pt", "Platinum", "transition-metal", 10, 6, "d"],
  [79, "Au", "Gold", "transition-metal", 11, 6, "d"],
  [80, "Hg", "Mercury", "transition-metal", 12, 6, "d"],
  [81, "Tl", "Thallium", "post-transition-metal", 13, 6, "p"],
  [82, "Pb", "Lead", "post-transition-metal", 14, 6, "p"],
  [83, "Bi", "Bismuth", "post-transition-metal", 15, 6, "p"],
  [84, "Po", "Polonium", "post-transition-metal", 16, 6, "p"],
  [85, "At", "Astatine", "halogen", 17, 6, "p"],
  [86, "Rn", "Radon", "noble-gas", 18, 6, "p"],
  [87, "Fr", "Francium", "alkali-metal", 1, 7, "s"],
  [88, "Ra", "Radium", "alkaline-earth-metal", 2, 7, "s"],
  [89, "Ac", "Actinium", "actinide", 3, 7, "f"],
  [90, "Th", "Thorium", "actinide", 3, 7, "f"],
  [91, "Pa", "Protactinium", "actinide", 3, 7, "f"],
  [92, "U", "Uranium", "actinide", 3, 7, "f"],
  [93, "Np", "Neptunium", "actinide", 3, 7, "f"],
  [94, "Pu", "Plutonium", "actinide", 3, 7, "f"],
  [95, "Am", "Americium", "actinide", 3, 7, "f"],
  [96, "Cm", "Curium", "actinide", 3, 7, "f"],
  [97, "Bk", "Berkelium", "actinide", 3, 7, "f"],
  [98, "Cf", "Californium", "actinide", 3, 7, "f"],
  [99, "Es", "Einsteinium", "actinide", 3, 7, "f"],
  [100, "Fm", "Fermium", "actinide", 3, 7, "f"],
  [101, "Md", "Mendelevium", "actinide", 3, 7, "f"],
  [102, "No", "Nobelium", "actinide", 3, 7, "f"],
  [103, "Lr", "Lawrencium", "actinide", 3, 7, "f"],
  [104, "Rf", "Rutherfordium", "transition-metal", 4, 7, "d"],
  [105, "Db", "Dubnium", "transition-metal", 5, 7, "d"],
  [106, "Sg", "Seaborgium", "transition-metal", 6, 7, "d"],
  [107, "Bh", "Bohrium", "transition-metal", 7, 7, "d"],
  [108, "Hs", "Hassium", "transition-metal", 8, 7, "d"],
  [109, "Mt", "Meitnerium", "unknown", 9, 7, "d"],
  [110, "Ds", "Darmstadtium", "unknown", 10, 7, "d"],
  [111, "Rg", "Roentgenium", "unknown", 11, 7, "d"],
  [112, "Cn", "Copernicium", "unknown", 12, 7, "d"],
  [113, "Nh", "Nihonium", "unknown", 13, 7, "p"],
  [114, "Fl", "Flerovium", "unknown", 14, 7, "p"],
  [115, "Mc", "Moscovium", "unknown", 15, 7, "p"],
  [116, "Lv", "Livermorium", "unknown", 16, 7, "p"],
  [117, "Ts", "Tennessine", "unknown", 17, 7, "p"],
  [118, "Og", "Oganesson", "noble-gas", 18, 7, "p"],
];

export const ELEMENTS: ElementDatum[] = ROWS.map(
  ([z, symbol, name, category, group, period, block]) => ({
    z,
    symbol,
    name,
    category,
    group,
    period,
    block,
    mass: ATOMIC_MASS[symbol],
    ...ELEMENT_PROPERTIES[z],
  }),
);

export const ELEMENT_BY_Z: Record<number, ElementDatum> = Object.fromEntries(
  ELEMENTS.map((e) => [e.z, e]),
);

export const ELEMENT_BY_SYMBOL: Record<string, ElementDatum> = Object.fromEntries(
  ELEMENTS.map((e) => [e.symbol, e]),
);

/** True for lanthanides/actinides, which render in the strip below the table. */
export const isFBlock = (e: ElementDatum): boolean =>
  e.category === "lanthanide" || e.category === "actinide";

/**
 * Category presentation — one flat, muted hue per category (§4.5). The signature
 * golden accent is reserved for the active/selected element, so no category uses
 * it. Charcoal (`--color-ink`) text sits on every fill for consistent contrast.
 */
export const CATEGORY_META: Record<
  ElementCategory,
  { label: string; fill: string }
> = {
  "alkali-metal": { label: "Alkali metal", fill: "#ecc7bb" },
  "alkaline-earth-metal": { label: "Alkaline earth metal", fill: "#f2dcae" },
  "transition-metal": { label: "Transition metal", fill: "#c6d6e8" },
  "post-transition-metal": { label: "Post-transition metal", fill: "#d3dbdd" },
  metalloid: { label: "Metalloid", fill: "#bfdfd2" },
  nonmetal: { label: "Reactive nonmetal", fill: "#cfe3bf" },
  halogen: { label: "Halogen", fill: "#c3e0e2" },
  "noble-gas": { label: "Noble gas", fill: "#d8cfe8" },
  lanthanide: { label: "Lanthanide", fill: "#eccdda" },
  actinide: { label: "Actinide", fill: "#e6c4d6" },
  unknown: { label: "Unknown / predicted", fill: "#dcd8cf" },
};

/** Legend order — metals → metalloids → nonmetals → f-block → predicted. */
export const CATEGORY_ORDER: ElementCategory[] = [
  "alkali-metal",
  "alkaline-earth-metal",
  "transition-metal",
  "post-transition-metal",
  "metalloid",
  "nonmetal",
  "halogen",
  "noble-gas",
  "lanthanide",
  "actinide",
  "unknown",
];
