import type { ReactNode } from "react";
import {
  AFFORDANCE_LABELS,
  MATERIAL_LABELS,
  PRECISION_LABELS,
  type Apparatus,
} from "@/data/apparatus";
import { Pill } from "@/components/ui/Pill";

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5">
      <dt className="text-xs text-ink-3">{label}</dt>
      <dd className="text-right text-sm font-medium text-ink">{value}</dd>
    </div>
  );
}

/** Structured spec sheet for an apparatus — shown in the detail popover. */
export function SpecList({ apparatus }: { apparatus: Apparatus }) {
  const rows: { label: string; value: ReactNode }[] = [];

  if (apparatus.capacityMl != null)
    rows.push({ label: "Capacity", value: `${apparatus.capacityMl} mL` });
  if (apparatus.toleranceClass)
    rows.push({ label: "Tolerance class", value: `Class ${apparatus.toleranceClass}` });
  if (apparatus.toleranceMl != null)
    rows.push({ label: "Tolerance", value: `±${apparatus.toleranceMl} mL` });
  if (apparatus.graduations)
    rows.push({ label: "Graduations", value: apparatus.graduations });
  if (apparatus.maxTempC != null)
    rows.push({ label: "Max temperature", value: `${apparatus.maxTempC} °C` });
  rows.push({ label: "Material", value: MATERIAL_LABELS[apparatus.material] });
  if (apparatus.precision)
    rows.push({ label: "Precision", value: PRECISION_LABELS[apparatus.precision] });

  return (
    <div>
      <dl className="divide-y divide-line">
        {rows.map((row) => (
          <Row key={row.label} label={row.label} value={row.value} />
        ))}
      </dl>
      <div className="mt-3 border-t border-line pt-3">
        <p className="mb-2 text-xs text-ink-3">Can be used to</p>
        <div className="flex flex-wrap gap-1.5">
          {apparatus.affordances.map((affordance) => (
            <Pill key={affordance} tone="soft">
              {AFFORDANCE_LABELS[affordance]}
            </Pill>
          ))}
        </div>
      </div>
    </div>
  );
}
