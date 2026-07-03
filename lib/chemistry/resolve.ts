/**
 * Mixture → appearance resolver (§1.2, seed of the Module 2 engine).
 *
 * Pure and deterministic. Reactions are expressed as data (a rule list, each
 * carrying its balanced equation) so the set scales without touching logic and
 * the observation log can display the equation of whatever is happening.
 */
import { getReagent, COLORLESS_TINT } from "./reagents";

export interface MixtureComponent {
  reagentId: string;
  amountMl: number;
}

export interface Observable {
  /** Stable id so the observation log can de-duplicate. */
  id: string;
  text: string;
  kind: "color" | "precipitate" | "gas" | "thermal" | "note";
  /** Balanced equation for this reaction, if one applies. */
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

const PINK = "#e85c8a";
const BOILING_POINT_C = 99.5;

/**
 * Two-reagent reactions. Effects: `precipitate` colour, `gas` (bubbles),
 * `colorOverride` (e.g. a complex), or `thermal` (exotherm note).
 */
interface ComboRule {
  id: string;
  reactants: [string, string];
  equation: string;
  text: string;
  kind: Observable["kind"];
  precipitate?: string;
  gas?: boolean;
  colorOverride?: string;
  thermal?: boolean;
}

const COMBO_RULES: ComboRule[] = [
  // ── Precipitations ──
  {
    id: "agcl",
    reactants: ["agno3", "nacl"],
    equation: "AgNO₃ + NaCl → AgCl↓ + NaNO₃",
    text: "A white silver chloride precipitate forms.",
    kind: "precipitate",
    precipitate: "#eef0ee",
  },
  {
    id: "cu-oh2",
    reactants: ["cuso4", "naoh"],
    equation: "CuSO₄ + 2NaOH → Cu(OH)₂↓ + Na₂SO₄",
    text: "A pale-blue copper(II) hydroxide precipitate forms.",
    kind: "precipitate",
    precipitate: "#2b73b8",
  },
  {
    id: "fe-oh3",
    reactants: ["fecl3", "naoh"],
    equation: "FeCl₃ + 3NaOH → Fe(OH)₃↓ + 3NaCl",
    text: "A red-brown iron(III) hydroxide precipitate forms.",
    kind: "precipitate",
    precipitate: "#6b3f22",
  },
  {
    id: "pbi2",
    reactants: ["pb_no3", "ki"],
    equation: "Pb(NO₃)₂ + 2KI → PbI₂↓ + 2KNO₃",
    text: "Bright-yellow lead(II) iodide precipitates — the ‘golden rain’.",
    kind: "precipitate",
    precipitate: "#e6c72e",
  },
  {
    id: "baso4",
    reactants: ["bacl2", "h2so4"],
    equation: "BaCl₂ + H₂SO₄ → BaSO₄↓ + 2HCl",
    text: "A dense white barium sulfate precipitate forms.",
    kind: "precipitate",
    precipitate: "#eef0ee",
  },
  // ── Complex ──
  {
    id: "cu-ammine",
    reactants: ["cuso4", "ammonia"],
    equation: "CuSO₄ + 4NH₃ → [Cu(NH₃)₄]SO₄",
    text: "A deep-blue copper–ammonia complex forms.",
    kind: "color",
    colorOverride: "#173fa6",
  },
  // ── Gas ──
  {
    id: "co2-na2co3-hcl",
    reactants: ["na2co3", "hcl"],
    equation: "Na₂CO₃ + 2HCl → 2NaCl + H₂O + CO₂↑",
    text: "Carbon dioxide fizzes off as bubbles.",
    kind: "gas",
    gas: true,
  },
  {
    id: "co2-na2co3-h2so4",
    reactants: ["na2co3", "h2so4"],
    equation: "Na₂CO₃ + H₂SO₄ → Na₂SO₄ + H₂O + CO₂↑",
    text: "Carbon dioxide fizzes off as bubbles.",
    kind: "gas",
    gas: true,
  },
  {
    id: "co2-caco3-hcl",
    reactants: ["caco3", "hcl"],
    equation: "CaCO₃ + 2HCl → CaCl₂ + H₂O + CO₂↑",
    text: "The carbonate fizzes, releasing carbon dioxide.",
    kind: "gas",
    gas: true,
  },
  // ── Neutralisations (exothermic) ──
  {
    id: "neutralise-hcl-naoh",
    reactants: ["hcl", "naoh"],
    equation: "HCl + NaOH → NaCl + H₂O",
    text: "Acid and base neutralise, releasing heat.",
    kind: "thermal",
    thermal: true,
  },
  {
    id: "neutralise-h2so4-naoh",
    reactants: ["h2so4", "naoh"],
    equation: "H₂SO₄ + 2NaOH → Na₂SO₄ + 2H₂O",
    text: "Acid and base neutralise, releasing heat.",
    kind: "thermal",
    thermal: true,
  },
];

// ── colour helpers ────────────────────────────────────────────
type Rgb = [number, number, number];

function hexToRgb(hex: string): Rgb {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function rgbToHex([r, g, b]: Rgb): string {
  const c = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

function mix(a: string, b: string, t: number): string {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  return rgbToHex([
    ca[0] + (cb[0] - ca[0]) * t,
    ca[1] + (cb[1] - ca[1]) * t,
    ca[2] + (cb[2] - ca[2]) * t,
  ]);
}

export function totalVolume(components: MixtureComponent[]): number {
  return components.reduce((sum, c) => sum + c.amountMl, 0);
}

function amountOf(components: MixtureComponent[], id: string): number {
  return components.find((c) => c.reagentId === id)?.amountMl ?? 0;
}

function blendColor(components: MixtureComponent[], volume: number): string {
  if (volume <= 0) return COLORLESS_TINT;
  const acc: Rgb = [0, 0, 0];
  for (const c of components) {
    const reagent = getReagent(c.reagentId);
    if (!reagent) continue;
    const [r, g, b] = hexToRgb(reagent.color);
    const w = c.amountMl / volume;
    acc[0] += r * w;
    acc[1] += g * w;
    acc[2] += b * w;
  }
  return rgbToHex(acc);
}

export function resolveAppearance(
  components: MixtureComponent[],
  temperatureC: number,
): Appearance {
  const volume = totalVolume(components);
  const observables: Observable[] = [];

  if (volume <= 0) {
    return {
      liquidColor: COLORLESS_TINT,
      liquidOpacity: 0,
      precipitate: null,
      gasRate: 0,
      boiling: false,
      observables,
    };
  }

  const amt = (id: string) => amountOf(components, id);

  let liquidColor = blendColor(components, volume);
  let liquidOpacity = 0.55;
  let precipitate: Appearance["precipitate"] = null;
  let gasRate = 0;

  if (amt("cuso4") || amt("kmno4") || amt("fecl3") || amt("cocl2")) {
    liquidOpacity = 0.82;
  }

  // Data-driven two-reagent reactions.
  for (const rule of COMBO_RULES) {
    const a = amt(rule.reactants[0]);
    const b = amt(rule.reactants[1]);
    if (a <= 0 || b <= 0) continue;

    if (rule.precipitate) {
      precipitate = { color: rule.precipitate, amount: Math.min(a, b) };
      liquidOpacity = 0.9;
    }
    if (rule.gas) {
      gasRate = Math.max(gasRate, Math.min(1, Math.min(a, b) / 25));
    }
    if (rule.colorOverride) {
      liquidColor = rule.colorOverride;
      liquidOpacity = Math.max(liquidOpacity, 0.85);
    }
    observables.push({
      id: rule.id,
      text: rule.text,
      kind: rule.kind,
      equation: rule.equation,
    });
  }

  // Indicators (only meaningful when there's an acid or base present).
  const acidAmt = amt("hcl") + amt("h2so4");
  const baseAmt = amt("naoh") + amt("na2co3") + amt("ammonia");
  const hasAcidBase = acidAmt > 0 || baseAmt > 0;
  const net = acidAmt - baseAmt; // > 0 acidic, < 0 basic

  if (hasAcidBase && amt("phenolphthalein") > 0 && net < -2) {
    liquidColor = mix(liquidColor, PINK, 0.85);
    liquidOpacity = Math.max(liquidOpacity, 0.7);
    observables.push({
      id: "ind-phph",
      kind: "color",
      text: "Phenolphthalein turns pink — the solution is basic.",
    });
  }
  if (hasAcidBase && amt("methyl_orange") > 0) {
    if (net > 2) {
      liquidColor = mix(liquidColor, "#e0492e", 0.8);
      observables.push({
        id: "ind-mo-acid",
        kind: "color",
        text: "Methyl orange turns red — the solution is acidic.",
      });
    } else {
      liquidColor = mix(liquidColor, "#f0a11f", 0.7);
      observables.push({
        id: "ind-mo-base",
        kind: "color",
        text: "Methyl orange stays yellow-orange — not acidic.",
      });
    }
  }
  if (hasAcidBase && amt("bromothymol") > 0) {
    if (net > 2) {
      liquidColor = mix(liquidColor, "#d9c73a", 0.75);
      observables.push({
        id: "ind-btb-acid",
        kind: "color",
        text: "Bromothymol blue turns yellow — acidic.",
      });
    } else if (net < -2) {
      liquidColor = mix(liquidColor, "#2f68cf", 0.8);
      observables.push({
        id: "ind-btb-base",
        kind: "color",
        text: "Bromothymol blue turns blue — basic.",
      });
    } else {
      liquidColor = mix(liquidColor, "#3f9e54", 0.75);
      observables.push({
        id: "ind-btb-neutral",
        kind: "color",
        text: "Bromothymol blue is green — close to neutral.",
      });
    }
  }

  // Boiling
  const boiling = temperatureC >= BOILING_POINT_C;
  if (boiling) {
    gasRate = Math.max(gasRate, 0.8);
    observables.push({
      id: "boil",
      kind: "gas",
      text: "The solution reaches 100 °C and boils.",
      equation: "H₂O(l) ⇌ H₂O(g)",
    });
  }

  return {
    liquidColor,
    liquidOpacity,
    precipitate,
    gasRate,
    boiling,
    observables,
  };
}
