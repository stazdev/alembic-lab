"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { Apparatus } from "@/data/apparatus";
import { ApparatusCard } from "./ApparatusCard";

export function ApparatusGrid({ items }: { items: Apparatus[] }) {
  return (
    <motion.div
      layout
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
    >
      <AnimatePresence mode="popLayout">
        {items.map((apparatus) => (
          <ApparatusCard key={apparatus.id} apparatus={apparatus} />
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
