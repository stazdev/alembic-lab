"use client";

import { FUNCTIONAL_GROUPS, FG_TESTS } from "@/data/functionalGroups";
import { cn } from "@/lib/utils";

/**
 * Qualitative functional-group test reference — a matrix of bench reagents
 * against the common functional groups. Shaded cells are positive results.
 */
export function FunctionalGroupsTool() {
  return (
    <div className="space-y-4">
      <p className="text-xs text-ink-2">
        Common qualitative bench tests and how each functional group responds. A
        shaded cell is a positive result; the observation is what you would see.
      </p>
      <div className="overflow-x-auto rounded-card border border-line bg-surface">
        <table className="w-full min-w-[760px] border-separate border-spacing-0 text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-surface px-3 py-2.5 text-left text-xs font-medium text-ink-3">
                Reagent
              </th>
              {FUNCTIONAL_GROUPS.map((g) => (
                <th
                  key={g.id}
                  className="px-3 py-2.5 text-left text-xs font-semibold text-ink"
                >
                  {g.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FG_TESTS.map((t) => (
              <tr key={t.id}>
                <td className="sticky left-0 z-10 border-t border-line bg-surface px-3 py-2.5 font-medium text-ink">
                  {t.reagent}
                </td>
                {FUNCTIONAL_GROUPS.map((g) => {
                  const r = t.results[g.id];
                  return (
                    <td
                      key={g.id}
                      className={cn(
                        "border-t border-line px-3 py-2.5 align-top text-xs",
                        r ? "bg-accent-soft font-medium text-ink" : "text-ink-3",
                      )}
                    >
                      {r ?? "—"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-ink-3">
        Tip: 2,4-DNPH confirms a carbonyl (aldehyde or ketone); Tollens' or
        Fehling's then singles out the aldehyde.
      </p>
    </div>
  );
}
