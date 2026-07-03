/**
 * Lab safety assessment (Module 4 · §4.3).
 *
 * Safety events are first-class learning outcomes. This pure function reads the
 * live vessel state the mixture engine already computes — reaction heat,
 * temperature, gas rate, pH, fill level — and flags risk by severity. The cause
 * is the real chemistry (same ΔH / gas / confinement), so the debrief teaches
 * genuine cause → effect rather than a scripted stunt. Returns the single
 * highest-severity event (or null when the bench is safe).
 */
export type SafetyTier = "advisory" | "caution" | "incident" | "critical";

export interface SafetyEvent {
  tier: SafetyTier;
  title: string;
  message: string; // what's happening + what to do
  chemistry?: string; // the underlying cause
}

export interface SafetyInput {
  temperatureC: number;
  heatKJ: number; // reaction heat available in the current mixture
  gasRate: number; // 0..1
  pH: number | null;
  volumeMl: number;
  capacityMl: number;
  heating: boolean; // external heater on
}

const TIER_RANK: Record<SafetyTier, number> = {
  advisory: 0,
  caution: 1,
  incident: 2,
  critical: 3,
};

export function assessSafety(input: SafetyInput): SafetyEvent | null {
  const { temperatureC, heatKJ, gasRate, pH, volumeMl, capacityMl, heating } =
    input;
  const fillFrac = capacityMl > 0 ? volumeMl / capacityMl : 0;
  const events: SafetyEvent[] = [];

  // ── Critical (contained): overpressure in a full, boiling, gassing vessel ──
  if (temperatureC >= 99.5 && gasRate >= 0.5 && fillFrac >= 0.85) {
    events.push({
      tier: "critical",
      title: "Overpressure risk",
      message:
        "A nearly-full vessel is boiling and evolving gas fast — in a sealed flask this is how it ruptures. Vent it, add headroom, and cut the heat.",
      chemistry:
        "Rapid gas evolution plus vapour in a confined, full vessel raises the internal pressure.",
    });
  }

  // ── Incident: reaction heat alone drives it toward boiling ──
  if (!heating && heatKJ >= 1.5 && temperatureC >= 90) {
    events.push({
      tier: "incident",
      title: "Runaway exotherm",
      message:
        "The reaction itself released enough heat to drive the mixture toward boiling — with no external heating. Add reagents slowly and cool the vessel.",
      chemistry: `Exothermic reaction (~${heatKJ.toFixed(1)} kJ) with too little thermal mass to absorb it.`,
    });
  }

  // ── Thermal ──
  if (temperatureC >= 99.5) {
    events.push({
      tier: heating ? "caution" : "incident",
      title: "Boiling",
      message: heating
        ? "The mixture has reached 100 °C and is boiling — watch for bumping and boil-over."
        : "The mixture boiled without a heater — the reaction supplied the heat.",
      chemistry: "Temperature has reached the boiling point of water.",
    });
  } else if (temperatureC >= 88) {
    events.push({
      tier: "caution",
      title: "Very hot",
      message:
        "The mixture is close to boiling. Use a heat-resistant grip and keep your face clear of the mouth of the vessel.",
    });
  } else if (temperatureC >= 45) {
    events.push({
      tier: "advisory",
      title: "Warm mixture",
      message: "The vessel is warm to the touch — an exothermic process is underway.",
    });
  }

  if (heatKJ >= 1.5 && temperatureC < 88) {
    events.push({
      tier: "caution",
      title: "Strongly exothermic",
      message:
        "This combination releases a lot of heat. Add the reagent in small portions and swirl to disperse it.",
      chemistry: `≈ ${heatKJ.toFixed(1)} kJ of reaction heat.`,
    });
  }

  // ── Corrosivity (pH) ──
  if (pH != null && volumeMl > 0) {
    if (pH <= 1 || pH >= 13) {
      events.push({
        tier: "caution",
        title: "Highly corrosive",
        message: `A ${pH <= 1 ? "strongly acidic" : "strongly alkaline"} solution (pH ${pH.toFixed(1)}). Wear goggles and gloves — and never add water to concentrated acid; add acid to water.`,
        chemistry: pH <= 1 ? "Very high [H⁺]." : "Very high [OH⁻].",
      });
    } else if (pH <= 3 || pH >= 11) {
      events.push({
        tier: "advisory",
        title: "Corrosive",
        message: `A ${pH <= 3 ? "acidic" : "basic"} solution (pH ${pH.toFixed(1)}) — wear eye protection.`,
      });
    }
  }

  // ── Gas ──
  if (gasRate >= 0.5 && temperatureC < 99.5) {
    events.push({
      tier: "caution",
      title: "Vigorous gas evolution",
      message:
        "The reaction is releasing gas quickly. Work in a fume hood and keep the vessel uncapped.",
    });
  }

  // ── Overfill ──
  if (fillFrac >= 0.92) {
    events.push({
      tier: "advisory",
      title: "Nearly full",
      message:
        "The vessel is almost full — leave headroom to avoid overflow when swirling or on gas evolution.",
    });
  }

  if (events.length === 0) return null;
  return events.sort((a, b) => TIER_RANK[b.tier] - TIER_RANK[a.tier])[0];
}
