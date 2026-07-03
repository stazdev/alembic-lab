"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import {
  useBench,
  selectTotalCount,
  type BenchItem,
} from "@/lib/stores/benchStore";
import { getApparatus } from "@/data/apparatus";
import { ApparatusIcon } from "@/components/chem/ApparatusIcon";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { NumberStepper } from "@/components/ui/NumberStepper";

const EASE: [number, number, number, number] = [0.2, 0.8, 0.2, 1];

function BenchRow({ item }: { item: BenchItem }) {
  const setQuantity = useBench((s) => s.setQuantity);
  const apparatus = getApparatus(item.apparatusId);
  if (!apparatus) return null;

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={{ duration: 0.2, ease: EASE }}
      className="flex items-center gap-3 rounded-ctrl bg-dark-2 p-2.5"
    >
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-ctrl bg-dark text-on-dark">
        <div className="h-7 w-7">
          <ApparatusIcon kind={apparatus.icon} />
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-on-dark">
          {apparatus.name}
        </p>
        <p className="truncate text-xs text-on-dark-2">{apparatus.summary}</p>
      </div>
      <NumberStepper
        tone="dark"
        value={item.quantity}
        min={0}
        max={12}
        onChange={(q) => setQuantity(item.apparatusId, q)}
        aria-label={`Quantity of ${apparatus.name}`}
      />
    </motion.li>
  );
}

function EmptyBench() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
      <div className="mb-3 h-12 w-12 text-on-dark-2 opacity-50">
        <ApparatusIcon kind="erlenmeyer" />
      </div>
      <p className="text-sm font-medium text-on-dark">Your bench is empty</p>
      <p className="mt-1 max-w-[220px] text-xs text-on-dark-2">
        Add apparatus from the inventory and it will appear here, ready for the
        sandbox.
      </p>
    </div>
  );
}

export function BenchTray() {
  const items = useBench((s) => s.items);
  const total = useBench(selectTotalCount);
  const clear = useBench((s) => s.clear);

  return (
    <Card tone="dark" className="flex h-full flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-on-dark">Your Bench</h2>
          <p className="text-xs text-on-dark-2">
            Apparatus staged for the sandbox
          </p>
        </div>
        {total > 0 && (
          <Pill tone="accent">
            {total} item{total > 1 ? "s" : ""}
          </Pill>
        )}
      </div>

      {items.length > 0 ? (
        <ul
          className="mt-4 flex-1 space-y-2 overflow-y-auto pr-1"
          style={{ maxHeight: 460 }}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {items.map((item) => (
              <BenchRow key={item.apparatusId} item={item} />
            ))}
          </AnimatePresence>
        </ul>
      ) : (
        <EmptyBench />
      )}

      <div className="mt-4 space-y-3 border-t border-dark-line pt-4">
        <Link
          href="/sandbox"
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-pill bg-accent px-5 text-sm font-medium text-accent-ink transition hover:bg-accent-strong active:scale-[0.98]"
        >
          Enter Sandbox
          <ArrowRight className="h-4 w-4" />
        </Link>
        {total > 0 && (
          <button
            type="button"
            onClick={clear}
            className="w-full text-center text-xs text-on-dark-2 transition hover:text-on-dark"
          >
            Clear bench
          </button>
        )}
        <p className="text-center text-[11px] leading-relaxed text-on-dark-2">
          Staged apparatus carry into the sandbox — or start with a default set.
        </p>
      </div>
    </Card>
  );
}
