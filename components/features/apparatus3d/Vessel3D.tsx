"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import type { ApparatusIconKind } from "@/data/apparatus";
import { cn } from "@/lib/utils";

// WebGL cannot render on the server — load the scene client-only (§4.1).
const VesselScene = dynamic(
  () => import("./VesselScene").then((m) => m.VesselScene),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-full w-full place-items-center">
        <Loader2 className="h-5 w-5 animate-spin text-ink-3" />
      </div>
    ),
  },
);

interface Vessel3DProps {
  iconKind: ApparatusIconKind;
  fillFrac?: number;
  liquidColor?: string;
  interactive?: boolean;
  className?: string;
}

export function Vessel3D({
  iconKind,
  fillFrac = 0.55,
  liquidColor = "#4f8fd6",
  interactive = true,
  className,
}: Vessel3DProps) {
  return (
    <div className={cn("relative h-full w-full", className)}>
      <VesselScene
        iconKind={iconKind}
        fillFrac={fillFrac}
        liquidColor={liquidColor}
        interactive={interactive}
      />
    </div>
  );
}
