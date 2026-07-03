"use client";

import { useBench, selectTotalCount } from "@/lib/stores/benchStore";

/** Dark stat tile showing the live count of apparatus on the bench. */
export function BenchCountStat() {
  const total = useBench(selectTotalCount);
  return (
    <div className="rounded-card bg-dark px-5 py-3 shadow-soft">
      <div className="text-3xl font-semibold tabular-nums text-on-dark">
        {total}
      </div>
      <div className="mt-0.5 text-xs text-on-dark-2">On bench</div>
    </div>
  );
}
