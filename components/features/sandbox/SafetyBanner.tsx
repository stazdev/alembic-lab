import type { MouseEvent } from "react";
import { AlertTriangle, Flame, Info, RotateCcw, ShieldAlert } from "lucide-react";
import type { SafetyEvent, SafetyTier } from "@/lib/chemistry/safety";
import { cn } from "@/lib/utils";

const TIER_STYLE: Record<
  SafetyTier,
  { wrap: string; chip: string; label: string; Icon: typeof Info }
> = {
  advisory: {
    wrap: "border-line bg-surface-2 text-ink-2",
    chip: "bg-surface text-ink-3",
    label: "Advisory",
    Icon: Info,
  },
  caution: {
    wrap: "border-accent-strong/40 bg-accent-soft text-ink",
    chip: "bg-accent text-accent-ink",
    label: "Caution",
    Icon: AlertTriangle,
  },
  incident: {
    wrap: "border-[#dcae9e] bg-[#f6e5de] text-[#7a2f1a]",
    chip: "bg-[#c0492e] text-white",
    label: "Incident",
    Icon: Flame,
  },
  critical: {
    wrap: "border-dark bg-dark text-on-dark",
    chip: "bg-[#e0492e] text-white",
    label: "Critical",
    Icon: ShieldAlert,
  },
};

/**
 * Renders a safety event as a tier-colored banner. For incidents and critical
 * events it also shows the underlying chemistry and a "Reset & learn" action —
 * the recover-and-continue loop, never a dead end (§4.3).
 */
export function SafetyBanner({
  event,
  onReset,
}: {
  event: SafetyEvent;
  onReset?: () => void;
}) {
  const s = TIER_STYLE[event.tier];
  const severe = event.tier === "incident" || event.tier === "critical";

  return (
    <div className={cn("rounded-ctrl border p-3 text-xs", s.wrap)}>
      <div className="flex items-center gap-2">
        <s.Icon className="h-4 w-4 shrink-0" />
        <span
          className={cn(
            "rounded-pill px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
            s.chip,
          )}
        >
          {s.label}
        </span>
        <span className="font-semibold">{event.title}</span>
      </div>
      <p className="mt-1.5 leading-relaxed">{event.message}</p>
      {severe && event.chemistry && (
        <p
          className={cn(
            "mt-1.5 border-t pt-1.5 text-[11px] opacity-80",
            event.tier === "critical" ? "border-dark-line" : "border-[#dcae9e]",
          )}
        >
          <span className="font-medium">Why: </span>
          {event.chemistry}
        </p>
      )}
      {severe && onReset && (
        <button
          type="button"
          onClick={(e: MouseEvent) => {
            e.stopPropagation();
            onReset();
          }}
          className={cn(
            "mt-2 inline-flex items-center gap-1 rounded-pill px-3 py-1 text-[11px] font-medium transition",
            event.tier === "critical"
              ? "bg-on-dark text-ink hover:opacity-90"
              : "bg-ink text-on-dark hover:bg-dark-2",
          )}
        >
          <RotateCcw className="h-3 w-3" /> Reset &amp; learn
        </button>
      )}
    </div>
  );
}
