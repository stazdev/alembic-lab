/**
 * Mixture engine (Module 1 §1.2 × Module 2 §2.1).
 *
 * The real reaction pipeline the sandbox runs on: convert reagents to moles,
 * apply reactions in priority order consuming reactants by the LIMITING reagent,
 * accumulate precipitate / gas / reaction heat, then compute the solution's pH
 * from what's left (reusing the pH engine) and project it all to an appearance.
 *
 * Pure and deterministic. Relative imports only, so it is Node-testable.
 */
import { getReagent, COLORLESS_TINT } from "./reagents";
import { strongAcidPH, strongBasePH, weakBasePH, pKaToKa } from "./ph";

export interface MixtureComponent {
  reagentId: string;
  amountMl: number;
}

export interface Observable {
  id: string;
  text: string;
  kind: "color" | "precipitate" | "gas" | "thermal" | "note";
  equation?: string;
}

export interface Appearance {
  liquidColor: string;
  liquidOpacity: number;
  precipitate: { color: string; amount: number } | null;
  gasRate: number;
  boiling: boolean;
  observables: Observable[];
}

export interface MixtureResult {
  appearance: Appearance;
  /** Solution pH, or null when there's no liquid. */
  pH: number | null;
  /** Total reaction heat released for this mixture (kJ). */
  heatKJ: number;
}

const PINK = "#e85c8a";
const BOILING_POINT_C = 99.5;
const KB_AMMONIA = pKaToKa(4.75); // ≈ 1.8×10⁻⁵

/** Sandbox reagent concentrations (mol/L) — lab-strength so effects are visible. */
const CONC: Record<string, number> = {
  hcl: 1, naoh: 1, h2so4: 1, ammonia: 1,
  na2co3: 0.5, caco3: 0.5,
  cuso4: 0.5, agno3: 0.5, nacl: 0.5, fecl3: 0.5,
  pb_no3: 0.5, ki: 0.5, bacl2: 0.5, cocl2: 0.5,
  kmno4: 0.1,
  na: 2, ca: 2, mg: 2, zn: 2, fe: 2, cu: 2,
};

interface Reaction {
  id: string;
  reactants: { id: string; coeff: number }[];
  /** Tracked products that re-enter the solution (only acids matter for pH). */
  produces?: { id: string; coeff: number }[];
  equation: string;
  text: string;
  kind: Observable["kind"];
  /** kJ per mole of reaction; negative = exothermic. */
  deltaHkJ: number;
  precipitate?: string;
  gas?: boolean;
  colorOverride?: string;
}

// Priority order: neutralisation → carbonate gas → hydroxide precip → other precip → complex.
const REACTIONS: Reaction[] = [
  {
    id: "neut-hcl-naoh",
    reactants: [{ id: "hcl", coeff: 1 }, { id: "naoh", coeff: 1 }],
    equation: "HCl + NaOH → NaCl + H₂O",
    text: "Acid and base neutralise, releasing heat.",
    kind: "thermal",
    deltaHkJ: -57.3,
  },
  {
    id: "neut-h2so4-naoh",
    reactants: [{ id: "h2so4", coeff: 1 }, { id: "naoh", coeff: 2 }],
    equation: "H₂SO₄ + 2NaOH → Na₂SO₄ + 2H₂O",
    text: "Acid and base neutralise, releasing heat.",
    kind: "thermal",
    deltaHkJ: -114.6,
  },
  {
    id: "co2-na2co3-hcl",
    reactants: [{ id: "na2co3", coeff: 1 }, { id: "hcl", coeff: 2 }],
    equation: "Na₂CO₃ + 2HCl → 2NaCl + H₂O + CO₂↑",
    text: "Carbon dioxide fizzes off as bubbles.",
    kind: "gas",
    deltaHkJ: -30,
    gas: true,
  },
  {
    id: "co2-caco3-hcl",
    reactants: [{ id: "caco3", coeff: 1 }, { id: "hcl", coeff: 2 }],
    equation: "CaCO₃ + 2HCl → CaCl₂ + H₂O + CO₂↑",
    text: "The carbonate fizzes, releasing carbon dioxide.",
    kind: "gas",
    deltaHkJ: -15,
    gas: true,
  },
  // ── Reactive metals (reactivity series) — H₂ evolution ──
  {
    id: "na-water",
    reactants: [{ id: "na", coeff: 2 }, { id: "water", coeff: 2 }],
    produces: [{ id: "naoh", coeff: 2 }],
    equation: "2Na + 2H₂O → 2NaOH + H₂↑",
    text: "Sodium skates across the surface, fizzing off hydrogen and turning the water strongly alkaline.",
    kind: "gas",
    deltaHkJ: -184,
    gas: true,
  },
  {
    id: "ca-water",
    reactants: [{ id: "ca", coeff: 1 }, { id: "water", coeff: 2 }],
    produces: [{ id: "naoh", coeff: 2 }],
    equation: "Ca + 2H₂O → Ca(OH)₂ + H₂↑",
    text: "Calcium bubbles steadily in the water, releasing hydrogen and forming an alkaline solution.",
    kind: "gas",
    deltaHkJ: -100,
    gas: true,
  },
  {
    id: "mg-hcl",
    reactants: [{ id: "mg", coeff: 1 }, { id: "hcl", coeff: 2 }],
    equation: "Mg + 2HCl → MgCl₂ + H₂↑",
    text: "Magnesium fizzes vigorously in the acid, streaming off hydrogen.",
    kind: "gas",
    deltaHkJ: -150,
    gas: true,
  },
  {
    id: "zn-hcl",
    reactants: [{ id: "zn", coeff: 1 }, { id: "hcl", coeff: 2 }],
    equation: "Zn + 2HCl → ZnCl₂ + H₂↑",
    text: "Zinc dissolves steadily in the acid, giving off hydrogen bubbles.",
    kind: "gas",
    deltaHkJ: -100,
    gas: true,
  },
  {
    id: "fe-hcl",
    reactants: [{ id: "fe", coeff: 1 }, { id: "hcl", coeff: 2 }],
    equation: "Fe + 2HCl → FeCl₂ + H₂↑",
    text: "Iron reacts slowly with the acid, releasing hydrogen.",
    kind: "gas",
    deltaHkJ: -88,
    gas: true,
  },
  {
    id: "cu-oh2",
    reactants: [{ id: "cuso4", coeff: 1 }, { id: "naoh", coeff: 2 }],
    equation: "CuSO₄ + 2NaOH → Cu(OH)₂↓ + Na₂SO₄",
    text: "A pale-blue copper(II) hydroxide precipitate forms.",
    kind: "precipitate",
    deltaHkJ: -50,
    precipitate: "#2b73b8",
  },
  {
    id: "fe-oh3",
    reactants: [{ id: "fecl3", coeff: 1 }, { id: "naoh", coeff: 3 }],
    equation: "FeCl₃ + 3NaOH → Fe(OH)₃↓ + 3NaCl",
    text: "A red-brown iron(III) hydroxide precipitate forms.",
    kind: "precipitate",
    deltaHkJ: -80,
    precipitate: "#6b3f22",
  },
  {
    id: "agcl",
    reactants: [{ id: "agno3", coeff: 1 }, { id: "nacl", coeff: 1 }],
    equation: "AgNO₃ + NaCl → AgCl↓ + NaNO₃",
    text: "A white silver chloride precipitate forms.",
    kind: "precipitate",
    deltaHkJ: -65.5,
    precipitate: "#eef0ee",
  },
  {
    id: "pbi2",
    reactants: [{ id: "pb_no3", coeff: 1 }, { id: "ki", coeff: 2 }],
    equation: "Pb(NO₃)₂ + 2KI → PbI₂↓ + 2KNO₃",
    text: "Bright-yellow lead(II) iodide precipitates.",
    kind: "precipitate",
    deltaHkJ: -45,
    precipitate: "#e6c72e",
  },
  {
    id: "baso4",
    reactants: [{ id: "bacl2", coeff: 1 }, { id: "h2so4", coeff: 1 }],
    produces: [{ id: "hcl", coeff: 2 }],
    equation: "BaCl₂ + H₂SO₄ → BaSO₄↓ + 2HCl",
    text: "A dense white barium sulfate precipitate forms.",
    kind: "precipitate",
    deltaHkJ: -25,
    precipitate: "#eef0ee",
  },
  {
    id: "cu-ammine",
    reactants: [{ id: "cuso4", coeff: 1 }, { id: "ammonia", coeff: 4 }],
    equation: "CuSO₄ + 4NH₃ → [Cu(NH₃)₄]SO₄",
    text: "A deep-blue copper–ammonia complex forms.",
    kind: "color",
    deltaHkJ: -40,
    colorOverride: "#173fa6",
  },
];

// ── colour helpers ────────────────────────────────────────────
type Rgb = [number, number, number];
function hexToRgb(hex: string): Rgb {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
function rgbToHex([r, g, b]: Rgb): string {
  const c = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}
function mix(a: string, b: string, t: number): string {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  return rgbToHex([ca[0] + (cb[0] - ca[0]) * t, ca[1] + (cb[1] - ca[1]) * t, ca[2] + (cb[2] - ca[2]) * t]);
}

export function totalVolume(components: MixtureComponent[]): number {
  return components.reduce((sum, c) => sum + c.amountMl, 0);
}

const molesFromMl = (id: string, amountMl: number): number =>
  (amountMl / 1000) * (CONC[id] ?? 0.5);

function clampPH(p: number): number {
  return Math.max(0, Math.min(14, p));
}

/** pH from the acids and bases remaining after reactions. */
function computePH(moles: Record<string, number>, volumeL: number): number {
  const H = (moles.hcl ?? 0) + 2 * (moles.h2so4 ?? 0);
  const strongOH = moles.naoh ?? 0;
  const weakBase = (moles.ammonia ?? 0) + 2 * (moles.na2co3 ?? 0) + 2 * (moles.caco3 ?? 0);
  if (H <= 1e-9 && strongOH <= 1e-9 && weakBase <= 1e-9) return 7;

  const net1 = H - strongOH; // strong acid vs strong base
  if (net1 > 1e-9) {
    const net2 = net1 - weakBase; // weak base then mops up excess acid
    if (net2 > 1e-9) return clampPH(strongAcidPH(net2 / volumeL));
    if (net2 < -1e-9) return clampPH(weakBasePH(-net2 / volumeL, KB_AMMONIA));
    return 7;
  }
  if (net1 < -1e-9) return clampPH(strongBasePH(-net1 / volumeL));
  return weakBase > 1e-9 ? clampPH(weakBasePH(weakBase / volumeL, KB_AMMONIA)) : 7;
}

function present(components: MixtureComponent[], id: string): boolean {
  return components.some((c) => c.reagentId === id && c.amountMl > 0);
}

export function resolveMixture(
  components: MixtureComponent[],
  temperatureC: number,
): MixtureResult {
  const volumeMl = totalVolume(components);
  const observables: Observable[] = [];
  const empty: Appearance = {
    liquidColor: COLORLESS_TINT,
    liquidOpacity: 0,
    precipitate: null,
    gasRate: 0,
    boiling: false,
    observables,
  };
  if (volumeMl <= 0) return { appearance: empty, pH: null, heatKJ: 0 };
  const V = volumeMl / 1000;

  // Local moles map (consumed as reactions proceed).
  const moles: Record<string, number> = {};
  for (const c of components) moles[c.reagentId] = molesFromMl(c.reagentId, c.amountMl);

  let heatKJ = 0;
  let precipitate: Appearance["precipitate"] = null;
  let precipExtent = 0;
  let gasRate = 0;
  let complexColor: string | null = null;

  for (const rxn of REACTIONS) {
    let extent = Infinity;
    for (const r of rxn.reactants) extent = Math.min(extent, (moles[r.id] ?? 0) / r.coeff);
    if (!Number.isFinite(extent) || extent <= 1e-9) continue;

    for (const r of rxn.reactants) moles[r.id] = (moles[r.id] ?? 0) - extent * r.coeff;
    if (rxn.produces) for (const p of rxn.produces) moles[p.id] = (moles[p.id] ?? 0) + extent * p.coeff;

    heatKJ += Math.max(0, -rxn.deltaHkJ) * extent;
    if (rxn.precipitate && extent > precipExtent) {
      precipExtent = extent;
      precipitate = { color: rxn.precipitate, amount: Math.min(25, extent * 1250) };
    }
    if (rxn.gas) gasRate = Math.max(gasRate, Math.min(1, extent / 0.006));
    if (rxn.colorOverride) complexColor = rxn.colorOverride;
    observables.push({ id: rxn.id, text: rxn.text, kind: rxn.kind, equation: rxn.equation });
  }

  // Reactivity-series teaching moment: copper can't displace H₂ from dilute acid.
  if ((moles.cu ?? 0) > 1e-9 && ((moles.hcl ?? 0) > 1e-9 || (moles.h2so4 ?? 0) > 1e-9)) {
    observables.push({
      id: "cu-inert",
      kind: "note",
      text: "The copper is unreactive — it sits below hydrogen in the reactivity series, so it can't displace hydrogen from dilute acid.",
    });
  }

  const pH = computePH(moles, V);

  // ── colour ──
  let acc: Rgb = [0, 0, 0];
  let totalMol = 0;
  for (const id in moles) {
    const reagent = getReagent(id);
    const m = moles[id];
    if (!reagent || m <= 1e-9) continue;
    if (reagent.role === "metal") continue; // undissolved solid — no liquid tint
    const [r, g, b] = hexToRgb(reagent.color);
    acc = [acc[0] + r * m, acc[1] + g * m, acc[2] + b * m];
    totalMol += m;
  }
  let liquidColor = totalMol > 0 ? rgbToHex([acc[0] / totalMol, acc[1] / totalMol, acc[2] / totalMol]) : COLORLESS_TINT;
  let liquidOpacity = 0.55;
  if (present(components, "cuso4") || present(components, "kmno4") || present(components, "fecl3") || present(components, "cocl2")) {
    liquidOpacity = 0.82;
  }
  if (complexColor) {
    liquidColor = complexColor;
    liquidOpacity = Math.max(liquidOpacity, 0.85);
  }
  if (precipitate) liquidOpacity = 0.9;

  // ── indicators (driven by the real pH) ──
  if (present(components, "phenolphthalein") && pH >= 8.2) {
    liquidColor = mix(liquidColor, PINK, 0.85);
    liquidOpacity = Math.max(liquidOpacity, 0.7);
    observables.push({ id: "ind-phph", kind: "color", text: `Phenolphthalein is pink — the solution is basic (pH ${pH.toFixed(1)}).` });
  }
  if (present(components, "methyl_orange")) {
    if (pH <= 3.5) {
      liquidColor = mix(liquidColor, "#e0492e", 0.8);
      observables.push({ id: "ind-mo-red", kind: "color", text: "Methyl orange is red — strongly acidic." });
    } else {
      liquidColor = mix(liquidColor, "#f0a11f", 0.7);
      observables.push({ id: "ind-mo-yellow", kind: "color", text: "Methyl orange is yellow-orange — not acidic." });
    }
  }
  if (present(components, "bromothymol")) {
    if (pH <= 6) {
      liquidColor = mix(liquidColor, "#d9c73a", 0.75);
      observables.push({ id: "ind-btb-yellow", kind: "color", text: "Bromothymol blue is yellow — acidic." });
    } else if (pH >= 7.6) {
      liquidColor = mix(liquidColor, "#2f68cf", 0.8);
      observables.push({ id: "ind-btb-blue", kind: "color", text: "Bromothymol blue is blue — basic." });
    } else {
      liquidColor = mix(liquidColor, "#3f9e54", 0.75);
      observables.push({ id: "ind-btb-green", kind: "color", text: "Bromothymol blue is green — near neutral." });
    }
  }

  // ── boiling ──
  const boiling = temperatureC >= BOILING_POINT_C;
  if (boiling) {
    gasRate = Math.max(gasRate, 0.8);
    observables.push({ id: "boil", kind: "gas", text: "The solution reaches 100 °C and boils.", equation: "H₂O(l) ⇌ H₂O(g)" });
  }

  return {
    appearance: { liquidColor, liquidOpacity, precipitate, gasRate, boiling, observables },
    pH,
    heatKJ,
  };
}
