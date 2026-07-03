"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { MOLECULE_BY_KEY } from "@/data/moleculeLibrary";
import type { Representation } from "./MoleculeScene";

const MoleculeScene = dynamic(
  () => import("./MoleculeScene").then((m) => m.MoleculeScene),
  { ssr: false, loading: () => <Spinner /> },
);

function Centered({ children }: { children: ReactNode }) {
  return (
    <div className="grid h-full w-full place-items-center px-4 text-center">
      {children}
    </div>
  );
}
function Spinner() {
  return (
    <Centered>
      <Loader2 className="h-5 w-5 animate-spin text-ink-3" />
    </Centered>
  );
}

interface Molecule3DProps {
  /** A bundled library key; otherwise resolve via the proxy by `cid` or `name`. */
  moleculeKey?: string;
  name?: string;
  cid?: number;
  representation?: Representation;
  className?: string;
}

/**
 * Resolves a compound's 3D structure — bundled SDF first (offline, instant),
 * else the PubChem proxy — and hands the SDF to the client-only 3Dmol scene.
 * The same component is meant to be reused anywhere a structure is relevant
 * (compound cards, tasks, the reaction equation).
 */
export function Molecule3D({
  moleculeKey,
  name,
  cid,
  representation = "ball-stick",
  className,
}: Molecule3DProps) {
  const [sdf, setSdf] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setSdf(null);
    setError(null);

    (async () => {
      let url: string;
      if (moleculeKey && MOLECULE_BY_KEY[moleculeKey]) {
        url = `/structures/${moleculeKey}.sdf`;
      } else if (cid != null) {
        url = `/api/molecule?cid=${cid}`;
      } else if (name) {
        url = `/api/molecule?name=${encodeURIComponent(name)}`;
      } else {
        setError("No molecule specified.");
        return;
      }

      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(String(res.status));
        const text = await res.text();
        if (!cancelled) setSdf(text);
      } catch {
        if (!cancelled) setError("Couldn't load this structure.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [moleculeKey, name, cid]);

  return (
    <div className={cn("relative h-full w-full", className)}>
      {error ? (
        <Centered>
          <span className="text-xs text-ink-3">{error}</span>
        </Centered>
      ) : sdf ? (
        <MoleculeScene sdf={sdf} representation={representation} />
      ) : (
        <Spinner />
      )}
    </div>
  );
}
