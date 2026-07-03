"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ScrollText } from "lucide-react";
import { useSandbox, type Observation } from "@/lib/stores/sandboxStore";
import { Card } from "@/components/ui/Card";

const KIND_COLOR: Record<Observation["kind"], string> = {
  precipitate: "#b9b4a4",
  gas: "#4c86d9",
  thermal: "#e79b3f",
  color: "#e85c8a",
  note: "#9a978d",
};

export function ObservationLog() {
  const observations = useSandbox((s) => s.observations);
  const ordered = [...observations].reverse();

  return (
    <Card className="flex flex-col p-5">
      <div className="mb-3 flex items-center gap-2">
        <ScrollText className="h-4 w-4 text-ink-2" />
        <h2 className="text-base font-semibold text-ink">Observations</h2>
      </div>

      {ordered.length === 0 ? (
        <p className="py-6 text-center text-xs text-ink-3">
          Observations will appear here as you mix, heat, and react your
          reagents.
        </p>
      ) : (
        <ul
          className="space-y-2 overflow-y-auto pr-1"
          style={{ maxHeight: 320 }}
        >
          <AnimatePresence initial={false}>
            {ordered.map((obs) => (
              <motion.li
                key={obs.key}
                layout
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex gap-2.5 rounded-ctrl bg-surface-2 p-2.5"
              >
                <span
                  className="mt-1 h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: KIND_COLOR[obs.kind] }}
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-xs leading-snug text-ink">
                    {obs.text}
                  </span>
                  {obs.equation && (
                    <span className="mt-1.5 block overflow-x-auto whitespace-nowrap rounded-md border border-line bg-surface px-2 py-1 text-[11px] font-medium text-ink">
                      {obs.equation}
                    </span>
                  )}
                  <span className="mt-1 block text-[11px] text-ink-3">
                    {obs.vesselLabel}
                  </span>
                </span>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </Card>
  );
}
