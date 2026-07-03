"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Molecule3D } from "@/components/chem/Molecule3D";
import { StructureDiagram } from "@/components/chem/StructureDiagram";
import type { Representation } from "@/components/chem/MoleculeScene";

type View = "2d" | Representation;

/** The molecule viewer: a 2D skeletal diagram (if SMILES is known) plus the 3D
 *  scene with its representation toggles. */
export function MoleculeViewer({
  moleculeKey,
  name,
  cid,
  smiles,
}: {
  moleculeKey?: string;
  name?: string;
  cid?: number;
  smiles?: string;
}) {
  const [view, setView] = useState<View>("ball-stick");

  const options: { key: View; label: string }[] = [
    ...(smiles ? [{ key: "2d" as View, label: "2D skeletal" }] : []),
    { key: "ball-stick", label: "Ball & stick" },
    { key: "space-filling", label: "Space-filling" },
    { key: "wireframe", label: "Wireframe" },
  ];

  const is2d = view === "2d" && !!smiles;

  return (
    <div>
      <div className="relative h-[360px] overflow-hidden rounded-card border border-line bg-surface-2 sm:h-[440px]">
        {is2d && smiles ? (
          <StructureDiagram smiles={smiles} />
        ) : (
          <Molecule3D
            moleculeKey={moleculeKey}
            name={name}
            cid={cid}
            representation={view === "2d" ? "ball-stick" : view}
          />
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-2 text-center text-[11px] text-ink-3">
          {is2d ? "2D skeletal structure" : "drag to rotate · scroll to zoom"}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button
            key={o.key}
            type="button"
            onClick={() => setView(o.key)}
            aria-pressed={view === o.key}
            className={cn(
              "rounded-pill px-3.5 py-1.5 text-xs font-medium transition",
              view === o.key
                ? "bg-ink text-on-dark"
                : "border border-line bg-surface text-ink-2 hover:text-ink",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
