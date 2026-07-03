import { APPARATUS, CATEGORIES } from "@/data/apparatus";
import { BenchCountStat } from "@/components/features/bench/BenchCountStat";

function StatTile({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-card bg-surface px-5 py-3 shadow-soft">
      <div className="text-3xl font-semibold tabular-nums text-ink">{value}</div>
      <div className="mt-0.5 text-xs text-ink-2">{label}</div>
    </div>
  );
}

export function PageHeader() {
  const categoryCount = CATEGORIES.length - 1; // exclude the "All" pseudo-filter

  return (
    <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="mb-2 text-sm font-medium text-ink-2">
          Module 1 · The Lab &amp; Apparatus
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-ink lg:text-5xl">
          Inventory Room
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-2">
          Pick the right glassware and instruments for your experiment. Hover a
          card for details, then stage what you need on the bench — precision
          matters, so choose deliberately.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <StatTile value={String(APPARATUS.length)} label="Apparatus" />
        <StatTile value={String(categoryCount)} label="Categories" />
        <BenchCountStat />
      </div>
    </div>
  );
}
