"use client";

import type { MouseEvent } from "react";
import { Droplets, Flame, Thermometer, Trash2, X } from "lucide-react";
import { getApparatus } from "@/data/apparatus";
import { resolveAppearance, totalVolume } from "@/lib/chemistry/resolve";
import { useSandbox, type Vessel } from "@/lib/stores/sandboxStore";
import { VesselView } from "./VesselView";
import { IconButton } from "@/components/ui/IconButton";
import { Tooltip } from "@/components/ui/Tooltip";
import { cn } from "@/lib/utils";

export function VesselCard({ vessel }: { vessel: Vessel }) {
  const selectedId = useSandbox((s) => s.selectedVesselId);
  const pourSourceId = useSandbox((s) => s.pourSourceId);
  const select = useSandbox((s) => s.selectVessel);
  const toggleHeating = useSandbox((s) => s.toggleHeating);
  const beginPour = useSandbox((s) => s.beginPour);
  const cancelPour = useSandbox((s) => s.cancelPour);
  const pourInto = useSandbox((s) => s.pourInto);
  const clearVessel = useSandbox((s) => s.clearVessel);
  const removeVessel = useSandbox((s) => s.removeVessel);

  const apparatus = getApparatus(vessel.apparatusId);
  const capacity = apparatus?.capacityMl ?? 250;
  const iconKind = apparatus?.icon ?? "beaker";
  const volume = totalVolume(vessel.components);
  const fillFrac = volume / capacity;
  const appearance = resolveAppearance(vessel.components, vessel.temperatureC);

  const selected = selectedId === vessel.id;
  const isSource = pourSourceId === vessel.id;
  const isPourTarget = pourSourceId != null && !isSource;
  const temp = Math.round(vessel.temperatureC);

  function onCardClick() {
    if (isPourTarget) {
      pourInto(vessel.id);
    } else {
      select(vessel.id);
    }
  }

  function stop<T>(fn: (arg: T) => void, arg: T) {
    return (event: MouseEvent) => {
      event.stopPropagation();
      fn(arg);
    };
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onCardClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onCardClick();
        }
      }}
      className={cn(
        "group relative flex cursor-pointer flex-col rounded-card border bg-surface p-3 transition",
        selected && !isPourTarget && "border-accent-strong ring-2 ring-accent-strong/40",
        isPourTarget && "border-dashed border-accent-strong ring-2 ring-accent-strong/40",
        !selected && !isPourTarget && "border-line hover:border-line-strong",
      )}
    >
      {/* Pour-target overlay hint */}
      {isPourTarget && (
        <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center rounded-card bg-accent-soft/70">
          <span className="rounded-pill bg-ink px-3 py-1 text-xs font-semibold text-on-dark">
            Pour here
          </span>
        </div>
      )}

      {/* Header */}
      <div className="mb-1 flex items-center justify-between">
        <span className="truncate text-sm font-semibold text-ink">
          {vessel.label}
        </span>
        <Tooltip content="Remove vessel">
          <IconButton
            aria-label={`Remove ${vessel.label}`}
            variant="ghost"
            size="sm"
            className="h-7 w-7 opacity-0 transition group-hover:opacity-100"
            onClick={stop(removeVessel, vessel.id)}
          >
            <X className="h-3.5 w-3.5" />
          </IconButton>
        </Tooltip>
      </div>

      {/* Vessel drawing */}
      <div className="mx-auto h-40 w-full max-w-[150px]">
        <VesselView
          iconKind={iconKind}
          fillFrac={fillFrac}
          appearance={appearance}
          heating={vessel.heating}
        />
      </div>

      {/* Readouts */}
      <div className="mt-1 flex items-center justify-between text-xs">
        <span
          className={cn(
            "inline-flex items-center gap-1 font-medium",
            appearance.boiling
              ? "text-[#d97b32]"
              : vessel.heating
                ? "text-[#d97b32]"
                : "text-ink-2",
          )}
        >
          <Thermometer className="h-3.5 w-3.5" />
          {temp} °C{appearance.boiling ? " · boiling" : ""}
        </span>
        <span className="tabular-nums text-ink-3">
          {Math.round(volume)} / {capacity} mL
        </span>
      </div>

      {/* Actions */}
      <div className="mt-3 flex items-center gap-1.5 border-t border-line pt-3">
        <Tooltip content={vessel.heating ? "Turn off heat" : "Heat vessel"}>
          <IconButton
            aria-label={vessel.heating ? "Turn off heat" : "Heat vessel"}
            variant={vessel.heating ? "accent" : "surface"}
            size="sm"
            onClick={stop(toggleHeating, vessel.id)}
          >
            <Flame className="h-4 w-4" />
          </IconButton>
        </Tooltip>

        {isSource ? (
          <button
            type="button"
            onClick={stop(cancelPour, undefined as never)}
            className="flex-1 rounded-pill bg-ink px-3 py-2 text-xs font-medium text-on-dark"
          >
            Cancel pour
          </button>
        ) : (
          <Tooltip content="Pour into another vessel">
            <IconButton
              aria-label="Pour into another vessel"
              variant="surface"
              size="sm"
              disabled={volume <= 0.01 || isPourTarget}
              onClick={stop(beginPour, vessel.id)}
            >
              <Droplets className="h-4 w-4" />
            </IconButton>
          </Tooltip>
        )}

        <div className="flex-1" />

        <Tooltip content="Empty vessel">
          <IconButton
            aria-label={`Empty ${vessel.label}`}
            variant="surface"
            size="sm"
            disabled={volume <= 0.01}
            onClick={stop(clearVessel, vessel.id)}
          >
            <Trash2 className="h-4 w-4" />
          </IconButton>
        </Tooltip>
      </div>
    </div>
  );
}
