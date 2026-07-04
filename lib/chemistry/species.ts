/**
 * Ionic species, dissociation, solubility rules, and the activity series — the
 * data the general reaction engine (resolve.ts) reads. "Data over code": adding
 * chemistry is a data change here, not new branching in the engine.
 */

// ── ion identity & solution colour ────────────────────────────
export interface IonInfo {
  name: string;
  charge: number;
  /** Solution colour (hex) for coloured ions; omitted = colourless. */
  color?: string;
}

export const IONS: Record<string, IonInfo> = {
  // cations
  "H+": { name: "H⁺", charge: 1 },
  "Li+": { name: "Li⁺", charge: 1 },
  "Na+": { name: "Na⁺", charge: 1 },
  "K+": { name: "K⁺", charge: 1 },
  "NH4+": { name: "NH₄⁺", charge: 1 },
  "Ag+": { name: "Ag⁺", charge: 1 },
  "Mg2+": { name: "Mg²⁺", charge: 2 },
  "Ca2+": { name: "Ca²⁺", charge: 2 },
  "Ba2+": { name: "Ba²⁺", charge: 2 },
  "Zn2+": { name: "Zn²⁺", charge: 2 },
  "Fe2+": { name: "Fe²⁺", charge: 2, color: "#8fb98f" },
  "Fe3+": { name: "Fe³⁺", charge: 3, color: "#c07d2a" },
  "Cu2+": { name: "Cu²⁺", charge: 2, color: "#2f6fd0" },
  "Co2+": { name: "Co²⁺", charge: 2, color: "#d85f92" },
  "Pb2+": { name: "Pb²⁺", charge: 2 },
  "Sn2+": { name: "Sn²⁺", charge: 2 },
  "Al3+": { name: "Al³⁺", charge: 3 },
  // anions
  "OH-": { name: "OH⁻", charge: -1 },
  "Cl-": { name: "Cl⁻", charge: -1 },
  "Br-": { name: "Br⁻", charge: -1 },
  "I-": { name: "I⁻", charge: -1 },
  "NO3-": { name: "NO₃⁻", charge: -1 },
  "CH3COO-": { name: "CH₃COO⁻", charge: -1 },
  "SO4^2-": { name: "SO₄²⁻", charge: -2 },
  "CO3^2-": { name: "CO₃²⁻", charge: -2 },
  "HCO3-": { name: "HCO₃⁻", charge: -1 },
  "CrO4^2-": { name: "CrO₄²⁻", charge: -2, color: "#e6c72e" },
  "MnO4-": { name: "MnO₄⁻", charge: -1, color: "#7a2b96" },
};

// ── reagent → what it becomes in / does to solution ───────────
export interface ReagentSpec {
  /** Ions released per mole of reagent (dissolved salts, strong acid/base). */
  ions?: { id: string; n: number }[];
  /** A strong or weak acid: protons released per mole. */
  acid?: { protons: number; strong: boolean };
  /** A strong or weak base: hydroxides per mole (strong), or weak (NH₃). */
  base?: { hydroxide: number; strong: boolean };
  /** A metal element (solid) — reacts by the activity series. */
  metal?: string;
  /** Pure solvent. */
  water?: boolean;
  /** An indicator dye. */
  indicator?: "phph" | "mo" | "btb" | "universal";
  /** Sparingly-soluble solid (e.g. CaCO₃) — reacts with acid but isn't a free ion source. */
  solid?: boolean;
}

export const REAGENT_SPEC: Record<string, ReagentSpec> = {
  water: { water: true },

  // acids (anion enters solution; H⁺ tracked via `acid`)
  hcl: { acid: { protons: 1, strong: true }, ions: [{ id: "Cl-", n: 1 }] },
  h2so4: { acid: { protons: 2, strong: true }, ions: [{ id: "SO4^2-", n: 1 }] },
  hno3: { acid: { protons: 1, strong: true }, ions: [{ id: "NO3-", n: 1 }] },
  acetic: { acid: { protons: 1, strong: false }, ions: [{ id: "CH3COO-", n: 1 }] },

  // bases
  naoh: { base: { hydroxide: 1, strong: true }, ions: [{ id: "Na+", n: 1 }] },
  koh: { base: { hydroxide: 1, strong: true }, ions: [{ id: "K+", n: 1 }] },
  ammonia: { base: { hydroxide: 1, strong: false } },
  na2co3: { base: { hydroxide: 0, strong: false }, ions: [{ id: "Na+", n: 2 }, { id: "CO3^2-", n: 1 }] },
  nahco3: { base: { hydroxide: 0, strong: false }, ions: [{ id: "Na+", n: 1 }, { id: "HCO3-", n: 1 }] },

  // salts
  nacl: { ions: [{ id: "Na+", n: 1 }, { id: "Cl-", n: 1 }] },
  kcl: { ions: [{ id: "K+", n: 1 }, { id: "Cl-", n: 1 }] },
  kno3: { ions: [{ id: "K+", n: 1 }, { id: "NO3-", n: 1 }] },
  na2so4: { ions: [{ id: "Na+", n: 2 }, { id: "SO4^2-", n: 1 }] },
  nh4cl: { ions: [{ id: "NH4+", n: 1 }, { id: "Cl-", n: 1 }] },
  cuso4: { ions: [{ id: "Cu2+", n: 1 }, { id: "SO4^2-", n: 1 }] },
  cucl2: { ions: [{ id: "Cu2+", n: 1 }, { id: "Cl-", n: 2 }] },
  fecl3: { ions: [{ id: "Fe3+", n: 1 }, { id: "Cl-", n: 3 }] },
  feso4: { ions: [{ id: "Fe2+", n: 1 }, { id: "SO4^2-", n: 1 }] },
  znso4: { ions: [{ id: "Zn2+", n: 1 }, { id: "SO4^2-", n: 1 }] },
  mgso4: { ions: [{ id: "Mg2+", n: 1 }, { id: "SO4^2-", n: 1 }] },
  cacl2: { ions: [{ id: "Ca2+", n: 1 }, { id: "Cl-", n: 2 }] },
  agno3: { ions: [{ id: "Ag+", n: 1 }, { id: "NO3-", n: 1 }] },
  pb_no3: { ions: [{ id: "Pb2+", n: 1 }, { id: "NO3-", n: 2 }] },
  bacl2: { ions: [{ id: "Ba2+", n: 1 }, { id: "Cl-", n: 2 }] },
  ki: { ions: [{ id: "K+", n: 1 }, { id: "I-", n: 1 }] },
  kmno4: { ions: [{ id: "K+", n: 1 }, { id: "MnO4-", n: 1 }] },
  k2cro4: { ions: [{ id: "K+", n: 2 }, { id: "CrO4^2-", n: 1 }] },
  cocl2: { ions: [{ id: "Co2+", n: 1 }, { id: "Cl-", n: 2 }] },
  caco3: { solid: true, ions: [{ id: "Ca2+", n: 1 }, { id: "CO3^2-", n: 1 }] },

  // indicators
  phenolphthalein: { indicator: "phph" },
  methyl_orange: { indicator: "mo" },
  bromothymol: { indicator: "btb" },
  universal: { indicator: "universal" },

  // metal elements
  k: { metal: "K" },
  na: { metal: "Na" },
  li: { metal: "Li" },
  ca: { metal: "Ca" },
  mg: { metal: "Mg" },
  al: { metal: "Al" },
  zn: { metal: "Zn" },
  fe: { metal: "Fe" },
  sn: { metal: "Sn" },
  pb: { metal: "Pb" },
  cu: { metal: "Cu" },
};

// ── activity series (higher = more reactive) ──────────────────
export const ACTIVITY: Record<string, number> = {
  K: 100, Na: 96, Li: 98, Ca: 90, Mg: 80, Al: 70, Zn: 60, Fe: 50,
  Sn: 40, Pb: 35, H: 30, Cu: 20, Ag: 10,
};

/** Metals reactive enough to displace H₂ from cold water. */
export const REACTS_WITH_WATER = new Set(["K", "Na", "Li", "Ca"]);

/** Element → the cation it forms, with charge. */
export const METAL_CATION: Record<string, { id: string; charge: number }> = {
  Ag: { id: "Ag+", charge: 1 }, // not an addable element, but a displacement target
  K: { id: "K+", charge: 1 },
  Na: { id: "Na+", charge: 1 },
  Li: { id: "Li+", charge: 1 },
  Ca: { id: "Ca2+", charge: 2 },
  Mg: { id: "Mg2+", charge: 2 },
  Al: { id: "Al3+", charge: 3 },
  Zn: { id: "Zn2+", charge: 2 },
  Fe: { id: "Fe2+", charge: 2 },
  Sn: { id: "Sn2+", charge: 2 },
  Pb: { id: "Pb2+", charge: 2 },
  Cu: { id: "Cu2+", charge: 2 },
};

/** Cation id → the metal element it came from (for displacement). */
export const CATION_METAL: Record<string, string> = Object.fromEntries(
  Object.entries(METAL_CATION).map(([el, c]) => [c.id, el]),
);

// ── solubility rules ──────────────────────────────────────────
const SOLUBLE_CATIONS = new Set(["Na+", "K+", "Li+", "NH4+"]);

/** Is the salt of `cat` + `an` soluble in water? (Teaching-level rules.) */
export function isSoluble(cat: string, an: string): boolean {
  if (SOLUBLE_CATIONS.has(cat)) return true;
  if (an === "NO3-" || an === "CH3COO-") return true;
  if (an === "Cl-" || an === "Br-" || an === "I-") return !["Ag+", "Pb2+"].includes(cat);
  if (an === "SO4^2-") return !["Ba2+", "Pb2+", "Ca2+"].includes(cat);
  if (an === "OH-") return ["Ba2+", "Ca2+"].includes(cat); // Ca(OH)₂ slightly — treat soluble (limewater)
  if (["CO3^2-", "CrO4^2-"].includes(an)) return false;
  return true;
}

// ── precipitate identities (colour + name) ────────────────────
const CATION_NAME: Record<string, string> = {
  "Cu2+": "copper(II)", "Fe3+": "iron(III)", "Fe2+": "iron(II)", "Mg2+": "magnesium",
  "Al3+": "aluminium", "Zn2+": "zinc", "Pb2+": "lead(II)", "Ag+": "silver",
  "Ba2+": "barium", "Ca2+": "calcium", "Co2+": "cobalt(II)", "Sn2+": "tin(II)",
};
const ANION_NAME: Record<string, string> = {
  "OH-": "hydroxide", "Cl-": "chloride", "Br-": "bromide", "I-": "iodide",
  "SO4^2-": "sulfate", "CO3^2-": "carbonate", "CrO4^2-": "chromate",
};

const WHITE = "#eef0ee";
const PRECIP_COLOR: Record<string, string> = {
  "Cu2+/OH-": "#2b73b8",
  "Fe3+/OH-": "#6b3f22",
  "Fe2+/OH-": "#3f7d55",
  "Co2+/OH-": "#4f7fd0",
  "Ag+/Cl-": WHITE,
  "Ag+/Br-": "#efe6c8",
  "Ag+/I-": "#e6d24a",
  "Pb2+/I-": "#e6c72e",
  "Ag+/CrO4^2-": "#b5482e",
  "Ba2+/CrO4^2-": "#e6c72e",
  "Cu2+/CO3^2-": "#3f8f6a",
  "Fe3+/OH-alt": "#6b3f22",
};

export function precipitateInfo(cat: string, an: string): { color: string; name: string } {
  const color = PRECIP_COLOR[`${cat}/${an}`] ?? WHITE;
  const name = `${CATION_NAME[cat] ?? cat} ${ANION_NAME[an] ?? an}`;
  return { color, name };
}
