"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import type { RDKitModule } from "@rdkit/rdkit";
import { cn } from "@/lib/utils";

// Load RDKit.js once (script from public/rdkit, WASM alongside it). The heavy
// Emscripten module is loaded as a separate script rather than bundled. We cast
// `window` to a local shape because the package types it as always-present.
type RDKitGlobal = {
  RDKit?: RDKitModule;
  initRDKitModule?: (opts?: {
    locateFile?: (file: string) => string;
  }) => Promise<RDKitModule>;
};

let rdkitPromise: Promise<RDKitModule> | null = null;
function loadRDKit(): Promise<RDKitModule> {
  if (rdkitPromise) return rdkitPromise;
  rdkitPromise = new Promise<RDKitModule>((resolve, reject) => {
    const g = window as unknown as RDKitGlobal;
    if (g.RDKit) return resolve(g.RDKit);
    const fail = () => reject(new Error("RDKit failed to load"));
    const init = () => {
      const loader = g.initRDKitModule;
      if (!loader) return fail();
      loader({ locateFile: (f) => `/rdkit/${f}` })
        .then((RDKit) => {
          g.RDKit = RDKit;
          resolve(RDKit);
        })
        .catch(fail);
    };
    if (g.initRDKitModule) return init();
    const existing = document.getElementById("rdkit-script");
    if (existing) {
      existing.addEventListener("load", init);
      existing.addEventListener("error", fail);
      return;
    }
    const script = document.createElement("script");
    script.id = "rdkit-script";
    script.src = "/rdkit/RDKit_minimal.js";
    script.async = true;
    script.onload = init;
    script.onerror = fail;
    document.head.appendChild(script);
  });
  return rdkitPromise;
}

/**
 * 2D skeletal (line-angle) structure rendered from SMILES via RDKit.js
 * `get_svg()` (§3.3). Client-only — RDKit is a WASM module. The white
 * background rect is stripped so the drawing sits on the surrounding surface.
 */
export function StructureDiagram({
  smiles,
  width = 340,
  height = 260,
  className,
}: {
  smiles: string;
  width?: number;
  height?: number;
  className?: string;
}) {
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setSvg(null);
    setError(false);

    loadRDKit()
      .then((RDKit) => {
        if (cancelled) return;
        const mol = RDKit.get_mol(smiles);
        try {
          if (!mol || !mol.is_valid()) {
            setError(true);
            return;
          }
          const out = mol
            .get_svg(width, height)
            .replace(/<rect[^>]*fill:#FFFFFF[^>]*>\s*<\/rect>/i, "");
          if (!cancelled) setSvg(out);
        } finally {
          mol?.delete();
        }
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [smiles, width, height]);

  return (
    <div className={cn("grid h-full w-full place-items-center p-3", className)}>
      {error ? (
        <span className="text-xs text-ink-3">Couldn&apos;t render this structure.</span>
      ) : svg ? (
        <div
          className="[&_svg]:h-auto [&_svg]:max-h-full [&_svg]:w-auto [&_svg]:max-w-full"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ) : (
        <Loader2 className="h-5 w-5 animate-spin text-ink-3" />
      )}
    </div>
  );
}
