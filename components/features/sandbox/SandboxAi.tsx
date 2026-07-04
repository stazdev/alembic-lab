"use client";

/**
 * AI explainer for the selected vessel — grounds the tutor in the vessel's live,
 * engine-computed state (contents, pH, temperature, observations). Self-gates on
 * a connected key; renders nothing for an empty vessel.
 */
import { useSandbox } from "@/lib/stores/sandboxStore";
import { resolveMixture } from "@/lib/chemistry/resolve";
import { getReagent } from "@/lib/chemistry/reagents";
import { AiActionButton } from "@/components/features/ai/AiActionButton";
import { TUTOR_SYSTEM, renderContext } from "@/lib/ai/context";

export function SandboxAi() {
  const vessels = useSandbox((s) => s.vessels);
  const selectedId = useSandbox((s) => s.selectedVesselId);
  const vessel = vessels.find((v) => v.id === selectedId);
  if (!vessel || vessel.components.length === 0) return null;

  const mix = resolveMixture(vessel.components, vessel.temperatureC);
  const contents = vessel.components
    .map((c) => `${getReagent(c.reagentId)?.name ?? c.reagentId} (${Math.round(c.amountMl)} mL)`)
    .join(", ");

  const facts = [
    { label: "Vessel", value: vessel.label },
    { label: "Contents", value: contents },
    { label: "Temperature", value: `${Math.round(vessel.temperatureC)} °C` },
    ...(mix.pH != null ? [{ label: "pH", value: mix.pH.toFixed(1) }] : []),
    ...mix.appearance.observables.slice(0, 6).map((o, i) => ({
      label: `Observation ${i + 1}`,
      value: o.equation ? `${o.text} [${o.equation}]` : o.text,
    })),
  ];

  const prompt =
    renderContext({ page: "Sandbox bench", note: "a live experiment", facts }) +
    "\n\nExplain what is happening in this vessel and why, in plain language for a student. If nothing is reacting, say so and suggest something that would react.";

  return (
    <AiActionButton
      label="Explain this experiment"
      system={TUTOR_SYSTEM}
      prompt={prompt}
      maxOutputTokens={900}
    />
  );
}
