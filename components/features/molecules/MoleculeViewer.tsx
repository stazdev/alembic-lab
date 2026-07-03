"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Molecule3D } from "@/components/chem/Molecule3D";
import type { Representation } from "@/components/chem/MoleculeScene";

const REPS: { key: Representation; label: string }[] = [
  { key: "ball-stick", label: "Ball & stick" },
  { key: "space-filling", label: "Space-filling" },
  { key: "wireframe", label: "Wireframe" },
];

/** The 3D viewer plus its representation toggles. */
export function MoleculeViewer({
  moleculeKey,
  name,
  cid,
}: {
  moleculeKey?: string;
  name?: string;
  cid?: number;
}) {
  const [rep, setRep] = useState<Representation>("ball-stick");

  return (
    <div>
      <div className="relative h-[360px] overflow-hidden rounded-card border border-line bg-surface-2 sm:h-[440px]">
        <Molecule3D
          moleculeKey={moleculeKey}
          name={name}
          cid={cid}
          representation={rep}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-2 text-center text-[11px] text-ink-3">
          drag to rotate · scroll to zoom
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {REPS.map((r) => (
          <button
            key={r.key}
            type="button"
            onClick={() => setRep(r.key)}
            aria-pressed={rep === r.key}
            className={cn(
              "rounded-pill px-3 py-1.5 text-xs font-medium transition",
              rep === r.key
                ? "bg-ink text-on-dark"
                : "border border-line bg-surface text-ink-2 hover:text-ink",
            )}
          >
            {r.label}
          </button>
        ))}
      </div>
    </div>
  );
}
