/**
 * Mixture engine (Module 1 §1.2 × Module 2 §2.1).
 *
 * A GENERAL reaction engine — not a fixed list. It speciates every reagent into
 * ions (species.ts), then applies reaction CLASSES from first principles:
 *   • reactive metals with acid / water (activity series → H₂)
 *   • metal displacement (more-reactive metal displaces a metal ion)
 *   • acid–base neutralisation
 *   • carbonate/bicarbonate + acid, and ammonium + base → gas
 *   • precipitation of any insoluble cation×anion pair (solubility rules)
 *   • the Cu²⁺/ammonia complex
 * then computes pH from what remains and projects it to an appearance.
 *
 * Pure and deterministic. Relative imports only, so it is Node-testable.
 */
import { getReagent, REAGENTS, COLORLESS_TINT } from "./reagents";
import { strongAcidPH, strongBasePH, weakAcidPH, weakBasePH, pKaToKa } from "./ph";
import {
  REAGENT_SPEC,
  IONS,
  ACTIVITY,
  REACTS_WITH_WATER,
  METAL_CATION,
  CATION_METAL,
  isSoluble,
  precipitateInfo,
} from "./species";

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
const KA_ACETIC = pKaToKa(4.76);
const DEFAULT_CONC = 0.5;

const EPS = 1e-9;

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
  (amountMl / 1000) * (getReagent(id)?.concentrationM ?? DEFAULT_CONC);

const clampPH = (p: number): number => Math.max(0, Math.min(14, p));

// element symbol → display name (from the reagent list)
const ELEMENT_NAME: Record<string, string> = Object.fromEntries(
  REAGENTS.filter((r) => r.role === "metal").map((r) => [r.formula, r.name]),
);
const elName = (sym: string): string => ELEMENT_NAME[sym] ?? sym;

/** Net-ionic string for a metal reacting with acid. */
function metalAcidEq(sym: string, charge: number): string {
  const cat = METAL_CATION[sym]?.id ?? `${sym}${charge}+`;
  const catName = IONS[cat]?.name ?? cat;
  if (charge % 2 === 0)
    return `${sym} + ${charge}H⁺ → ${catName} + ${charge / 2}H₂↑`;
  return `2${sym} + ${2 * charge}H⁺ → 2${catName} + ${charge}H₂↑`;
}

function metalWaterEq(sym: string, charge: number): string {
  return charge === 1
    ? `2${sym} + 2H₂O → 2${sym}OH + H₂↑`
    : `${sym} + 2H₂O → ${sym}(OH)₂ + H₂↑`;
}

function precipEq(cat: string, an: string, name: string): string {
  return `${IONS[cat]?.name ?? cat} + ${IONS[an]?.name ?? an} → ${name}↓`;
}

interface Inv {
  ions: Record<string, number>;
  hStrong: number;
  ohStrong: number;
  weakAcid: number;
  weakBaseNH3: number;
}

/** pH from the strong acids/bases and weak species remaining after reactions. */
function computePH(inv: Inv, volumeL: number): number {
  const co3 = inv.ions["CO3^2-"] ?? 0;
  const hco3 = inv.ions["HCO3-"] ?? 0;
  const weakBase = inv.weakBaseNH3 + 2 * co3 + 0.5 * hco3; // carbonate is basic
  const H = inv.hStrong;
  const OH = inv.ohStrong;
  if (H <= EPS && OH <= EPS && weakBase <= EPS && inv.weakAcid <= EPS) return 7;

  const net = H - OH;
  if (net > EPS) {
    const net2 = net - weakBase; // weak base mops up excess acid
    if (net2 > EPS) return clampPH(strongAcidPH(net2 / volumeL));
    if (net2 < -EPS) return clampPH(weakBasePH(-net2 / volumeL, KB_AMMONIA));
    return 7;
  }
  if (net < -EPS) return clampPH(strongBasePH(-net / volumeL));
  if (weakBase > EPS) return clampPH(weakBasePH(weakBase / volumeL, KB_AMMONIA));
  if (inv.weakAcid > EPS) return clampPH(weakAcidPH(inv.weakAcid / volumeL, KA_ACETIC));
  return 7;
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

  // ── speciate ──
  const ions: Record<string, number> = {};
  const addIon = (id: string, mol: number) => {
    ions[id] = (ions[id] ?? 0) + mol;
  };
  const inv: Inv = { ions, hStrong: 0, ohStrong: 0, weakAcid: 0, weakBaseNH3: 0 };
  const metals: { element: string; mol: number }[] = [];
  const indicators = new Set<string>();
  let hasWater = false;

  for (const c of components) {
    const spec = REAGENT_SPEC[c.reagentId];
    if (!spec) continue;
    const mol = molesFromMl(c.reagentId, c.amountMl);
    if (spec.water) {
      hasWater = true;
      continue;
    }
    if (spec.metal) {
      metals.push({ element: spec.metal, mol });
      continue;
    }
    if (spec.indicator) {
      indicators.add(spec.indicator);
      continue;
    }
    if (spec.acid) {
      if (spec.acid.strong) inv.hStrong += mol * spec.acid.protons;
      else inv.weakAcid += mol;
    }
    if (spec.base) {
      if (spec.base.strong) inv.ohStrong += mol * spec.base.hydroxide;
      else if (!spec.ions) inv.weakBaseNH3 += mol; // ammonia (no spectator ions)
    }
    if (spec.ions) for (const i of spec.ions) addIon(i.id, mol * i.n);
  }

  // Water is available if a solvent was added or any aqueous (non-metal) reagent is present.
  const waterAvailable =
    hasWater || components.some((c) => !REAGENT_SPEC[c.reagentId]?.metal);

  let heatKJ = 0;
  let precip: Appearance["precipitate"] = null;
  let precipExtent = 0;
  let gasRate = 0;
  let complexColor: string | null = null;

  // ── 1. metal reactions ──
  for (const m of metals) {
    const act = ACTIVITY[m.element] ?? 0;
    const cat = METAL_CATION[m.element];
    let avail = m.mol;
    let reacted = false;

    if (inv.hStrong > EPS && act > ACTIVITY.H && cat) {
      const hUsed = Math.min(inv.hStrong, avail * cat.charge);
      inv.hStrong -= hUsed;
      const dissolved = hUsed / cat.charge;
      avail -= dissolved;
      addIon(cat.id, dissolved);
      gasRate = Math.max(gasRate, Math.min(1, dissolved / 0.006));
      heatKJ += 150 * dissolved;
      observables.push({
        id: `metal-acid-${m.element}`,
        kind: "gas",
        text: `${elName(m.element)} reacts with the acid, fizzing off hydrogen gas.`,
        equation: metalAcidEq(m.element, cat.charge),
      });
      reacted = true;
    } else if (REACTS_WITH_WATER.has(m.element) && waterAvailable && cat) {
      inv.ohStrong += avail * cat.charge;
      addIon(cat.id, avail);
      gasRate = Math.max(gasRate, Math.min(1, avail / 0.005));
      heatKJ += (m.element === "K" ? 400 : m.element === "Na" ? 184 : 200) * avail;
      avail = 0;
      observables.push({
        id: `metal-water-${m.element}`,
        kind: "gas",
        text: `${elName(m.element)} fizzes across the water, giving off hydrogen and turning the solution strongly alkaline.`,
        equation: metalWaterEq(m.element, cat.charge),
      });
      reacted = true;
    }

    // displacement: displace any less-reactive metal ion in solution
    if (avail > EPS && cat) {
      for (const ionId of Object.keys(ions)) {
        if (ions[ionId] <= EPS) continue;
        const other = CATION_METAL[ionId];
        if (!other || other === m.element) continue;
        if (act <= (ACTIVITY[other] ?? 0)) continue;
        const otherCharge = IONS[ionId]?.charge ?? 1;
        const otherReduced = Math.min(ions[ionId], (avail * cat.charge) / otherCharge);
        if (otherReduced <= EPS) continue;
        const metalOxidised = (otherReduced * otherCharge) / cat.charge;
        ions[ionId] -= otherReduced;
        addIon(cat.id, metalOxidised);
        avail -= metalOxidised;
        heatKJ += 60 * otherReduced;
        observables.push({
          id: `displace-${m.element}-${other}`,
          kind: "color",
          text: `${elName(m.element)} displaces ${elName(other)} from solution — the more reactive metal takes its place.`,
          equation: `${m.element} + ${IONS[ionId]?.name ?? ionId} → ${IONS[cat.id]?.name ?? cat.id} + ${other}`,
        });
        reacted = true;
        if (avail <= EPS) break;
      }
    }

    if (!reacted && m.element === "Cu" && inv.hStrong > EPS) {
      observables.push({
        id: "cu-inert",
        kind: "note",
        text: "The copper is unreactive — it sits below hydrogen in the reactivity series, so it can't displace hydrogen from dilute acid.",
      });
    }
  }

  // ── 2. acid–base neutralisation ──
  const neutral = Math.min(inv.hStrong, inv.ohStrong);
  if (neutral > EPS) {
    heatKJ += 57.3 * neutral;
    inv.hStrong -= neutral;
    inv.ohStrong -= neutral;
    observables.push({
      id: "neutralise",
      kind: "thermal",
      text: "Acid and base neutralise, releasing heat.",
      equation: "H⁺ + OH⁻ → H₂O",
    });
  }

  // carbonate / bicarbonate + acid → CO₂
  if (inv.hStrong > EPS && (ions["CO3^2-"] ?? 0) > EPS) {
    const extent = Math.min(ions["CO3^2-"], inv.hStrong / 2);
    ions["CO3^2-"] -= extent;
    inv.hStrong -= 2 * extent;
    gasRate = Math.max(gasRate, Math.min(1, extent / 0.005));
    heatKJ += 20 * extent;
    observables.push({
      id: "gas-co2-carbonate",
      kind: "gas",
      text: "The carbonate fizzes, giving off carbon dioxide.",
      equation: "CO₃²⁻ + 2H⁺ → H₂O + CO₂↑",
    });
  }
  if (inv.hStrong > EPS && (ions["HCO3-"] ?? 0) > EPS) {
    const extent = Math.min(ions["HCO3-"], inv.hStrong);
    ions["HCO3-"] -= extent;
    inv.hStrong -= extent;
    gasRate = Math.max(gasRate, Math.min(1, extent / 0.005));
    heatKJ += 10 * extent;
    observables.push({
      id: "gas-co2-bicarb",
      kind: "gas",
      text: "Bubbles of carbon dioxide fizz off the bicarbonate.",
      equation: "HCO₃⁻ + H⁺ → H₂O + CO₂↑",
    });
  }

  // ammonium + strong base → ammonia gas
  if (inv.ohStrong > EPS && (ions["NH4+"] ?? 0) > EPS) {
    const extent = Math.min(ions["NH4+"], inv.ohStrong);
    ions["NH4+"] -= extent;
    inv.ohStrong -= extent;
    inv.weakBaseNH3 += extent;
    gasRate = Math.max(gasRate, Math.min(0.6, extent / 0.01));
    observables.push({
      id: "gas-nh3",
      kind: "gas",
      text: "A pungent smell of ammonia is released.",
      equation: "NH₄⁺ + OH⁻ → NH₃↑ + H₂O",
    });
  }

  // ── 3. precipitation (hydroxide included) ──
  if (inv.ohStrong > EPS) addIon("OH-", inv.ohStrong);
  const cats = Object.keys(ions).filter((id) => (IONS[id]?.charge ?? 0) > 0 && ions[id] > EPS);
  const ans = Object.keys(ions).filter((id) => (IONS[id]?.charge ?? 0) < 0 && ions[id] > EPS);
  for (const cat of cats) {
    for (const an of ans) {
      if (ions[cat] <= EPS || ions[an] <= EPS) continue;
      if (isSoluble(cat, an)) continue;
      const catCharge = IONS[cat].charge;
      const anCharge = -IONS[an].charge;
      const xCat = anCharge; // cations per formula unit
      const yAn = catCharge; // anions per formula unit
      const units = Math.min(ions[cat] / xCat, ions[an] / yAn);
      if (units <= EPS) continue;
      ions[cat] -= units * xCat;
      ions[an] -= units * yAn;
      const info = precipitateInfo(cat, an);
      const amount = Math.min(25, units * 1250);
      if (amount > precipExtent) {
        precipExtent = amount;
        precip = { color: info.color, amount };
      }
      heatKJ += 15 * units;
      observables.push({
        id: `precip-${cat}-${an}`,
        kind: "precipitate",
        text: `A precipitate of ${info.name} forms.`,
        equation: precipEq(cat, an, info.name),
      });
    }
  }
  inv.ohStrong = ions["OH-"] ?? 0; // leftover strong base after any hydroxide precip

  // ── 4. Cu²⁺ + excess ammonia complex ──
  if ((ions["Cu2+"] ?? 0) > EPS && inv.weakBaseNH3 > 4 * (ions["Cu2+"] ?? 0)) {
    complexColor = "#173fa6";
    observables.push({
      id: "complex-cuammine",
      kind: "color",
      text: "Excess ammonia forms a deep-blue copper–ammonia complex.",
      equation: "Cu²⁺ + 4NH₃ → [Cu(NH₃)₄]²⁺",
    });
  }

  // ── 5. pH ──
  const pH = computePH(inv, V);

  // ── 6. colour from remaining coloured ions ──
  let acc: Rgb = [0, 0, 0];
  let totalMol = 0;
  for (const id in ions) {
    const color = IONS[id]?.color;
    const m = ions[id];
    if (!color || m <= EPS) continue;
    const [r, g, b] = hexToRgb(color);
    acc = [acc[0] + r * m, acc[1] + g * m, acc[2] + b * m];
    totalMol += m;
  }
  let liquidColor = totalMol > 0 ? rgbToHex([acc[0] / totalMol, acc[1] / totalMol, acc[2] / totalMol]) : COLORLESS_TINT;
  let liquidOpacity = 0.55;
  if (totalMol > EPS) liquidOpacity = 0.82;
  if (complexColor) {
    liquidColor = complexColor;
    liquidOpacity = Math.max(liquidOpacity, 0.85);
  }
  if (precip) liquidOpacity = 0.9;

  // ── 7. indicators (driven by real pH) ──
  if (indicators.has("phph")) {
    if (pH >= 8.2) {
      liquidColor = mix(liquidColor, PINK, 0.85);
      liquidOpacity = Math.max(liquidOpacity, 0.7);
      observables.push({ id: "ind-phph", kind: "color", text: `Phenolphthalein turns pink — the solution is basic (pH ${pH.toFixed(1)}).` });
    } else {
      observables.push({ id: "ind-phph-clear", kind: "color", text: "Phenolphthalein stays colourless — not basic." });
    }
  }
  if (indicators.has("mo")) {
    if (pH <= 3.5) {
      liquidColor = mix(liquidColor, "#e0492e", 0.8);
      observables.push({ id: "ind-mo-red", kind: "color", text: "Methyl orange is red — strongly acidic." });
    } else {
      liquidColor = mix(liquidColor, "#f0a11f", 0.7);
      observables.push({ id: "ind-mo-yellow", kind: "color", text: "Methyl orange is yellow-orange — not acidic." });
    }
  }
  if (indicators.has("btb")) {
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
  if (indicators.has("universal")) {
    const uni =
      pH <= 3 ? "#d1362b" : pH <= 6 ? "#e8873a" : pH < 8 ? "#4c9a4c" : pH < 11 ? "#2f6fd0" : "#5a3aa0";
    liquidColor = mix(liquidColor, uni, 0.82);
    liquidOpacity = Math.max(liquidOpacity, 0.7);
    observables.push({ id: "ind-universal", kind: "color", text: `Universal indicator reads about pH ${pH.toFixed(0)}.` });
  }

  // ── 8. boiling ──
  const boiling = temperatureC >= BOILING_POINT_C;
  if (boiling) {
    gasRate = Math.max(gasRate, 0.8);
    observables.push({ id: "boil", kind: "gas", text: "The solution reaches 100 °C and boils.", equation: "H₂O(l) ⇌ H₂O(g)" });
  }

  return {
    appearance: { liquidColor, liquidOpacity, precipitate: precip, gasRate, boiling, observables },
    pH,
    heatKJ,
  };
}
