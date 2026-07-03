"use client";

import { motion } from "framer-motion";
import { Info, Plus } from "lucide-react";
import { CATEGORIES, type Apparatus } from "@/data/apparatus";
import { useBench, selectQuantityFor } from "@/lib/stores/benchStore";
import { ApparatusIcon } from "./ApparatusIcon";
import { SpecList } from "./SpecList";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Pill } from "@/components/ui/Pill";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/Popover";
import { Vessel3D } from "@/components/features/apparatus3d/Vessel3D";
import { is3DVessel } from "@/lib/three/vesselProfiles";
import { cn } from "@/lib/utils";

const EASE: [number, number, number, number] = [0.2, 0.8, 0.2, 1];

function categoryLabel(id: Apparatus["category"]): string {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

export function ApparatusCard({ apparatus }: { apparatus: Apparatus }) {
  const add = useBench((s) => s.add);
  const quantity = useBench(selectQuantityFor(apparatus.id));
  const onBench = quantity > 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.24, ease: EASE }}
    >
      <div
        className={cn(
          "flex h-full flex-col rounded-card border bg-surface p-4 transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-lift",
          onBench ? "border-accent-strong/70" : "border-line",
        )}
      >
        {/* Icon tile */}
        <div className="relative mb-4 flex h-24 items-center justify-center rounded-ctrl bg-surface-2 text-ink">
          <div className="h-16 w-16">
            <ApparatusIcon kind={apparatus.icon} />
          </div>
          {onBench && (
            <Pill tone="dark" className="absolute right-2.5 top-2.5">
              {quantity} on bench
            </Pill>
          )}
        </div>

        {/* Meta */}
        <div className="mb-1.5">
          <Pill tone="neutral">{categoryLabel(apparatus.category)}</Pill>
        </div>
        <h3 className="text-[15px] font-semibold leading-tight text-ink">
          {apparatus.name}
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-ink-2">
          {apparatus.summary}
        </p>

        {/* Actions */}
        <div className="mt-4 flex items-center gap-2 pt-1">
          <Button
            variant="accent"
            size="sm"
            className="flex-1"
            onClick={() => add(apparatus.id)}
          >
            <Plus className="h-4 w-4" />
            {onBench ? "Add another" : "Add to bench"}
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <IconButton aria-label={`Details for ${apparatus.name}`} size="sm">
                <Info className="h-4 w-4" />
              </IconButton>
            </PopoverTrigger>
            <PopoverContent
              side="left"
              align="start"
              className="max-h-[78vh] overflow-y-auto"
            >
              {is3DVessel(apparatus.icon) ? (
                <div className="mb-3 h-44 w-full overflow-hidden rounded-ctrl bg-surface-2">
                  <Vessel3D iconKind={apparatus.icon} />
                </div>
              ) : (
                <div className="mb-3 grid h-28 place-items-center rounded-ctrl bg-surface-2 text-ink">
                  <div className="h-16 w-16">
                    <ApparatusIcon kind={apparatus.icon} />
                  </div>
                </div>
              )}
              <div className="mb-2 flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-sm font-semibold text-ink">{apparatus.name}</h4>
                  <p className="text-xs text-ink-3">
                    {categoryLabel(apparatus.category)}
                  </p>
                </div>
                {is3DVessel(apparatus.icon) && (
                  <span className="shrink-0 rounded-pill bg-surface-2 px-2 py-1 text-[10px] font-medium text-ink-3">
                    Drag to rotate
                  </span>
                )}
              </div>
              <p className="mb-3 text-xs leading-relaxed text-ink-2">
                {apparatus.description}
              </p>
              <SpecList apparatus={apparatus} />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </motion.div>
  );
}
