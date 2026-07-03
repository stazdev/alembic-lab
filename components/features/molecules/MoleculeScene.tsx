"use client";

import { useEffect, useRef } from "react";

export type Representation = "ball-stick" | "space-filling" | "wireframe";

// 3Dmol style objects per representation. Ball-and-stick = thin sticks + small
// spheres; space-filling = full van-der-Waals spheres; wireframe = bond lines.
function styleFor(rep: Representation): Record<string, unknown> {
  if (rep === "space-filling") return { sphere: {} };
  if (rep === "wireframe") return { line: {} };
  return { stick: { radius: 0.14 }, sphere: { scale: 0.28 } };
}

/**
 * WebGL molecular viewer (3Dmol.js). Client-only — 3Dmol touches `window`, so
 * this module is loaded via `dynamic(..., { ssr: false })` and 3Dmol itself is
 * imported lazily inside the effect. Element colors use 3Dmol's built-in CPK
 * scheme. Orbit/zoom/pan are on by default.
 */
export function MoleculeScene({
  sdf,
  representation,
}: {
  sdf: string;
  representation: Representation;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const viewerRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;
    let observer: ResizeObserver | undefined;

    (async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mod: any = await import("3dmol");
      // Reach createViewer whether 3Dmol exports it on the namespace or default.
      const $3Dmol = mod.createViewer ? mod : (mod.default ?? mod);
      if (cancelled || !hostRef.current || typeof $3Dmol.createViewer !== "function")
        return;

      const viewer = $3Dmol.createViewer(hostRef.current, {
        backgroundColor: "0xfbf9f3", // --color-surface-2, so the canvas blends in
      });
      viewerRef.current = viewer;
      viewer.addModel(sdf, "sdf");
      viewer.setStyle({}, styleFor(representation));
      viewer.zoomTo();
      viewer.render();

      observer = new ResizeObserver(() => {
        try {
          viewer.resize();
          viewer.render();
        } catch {
          /* viewer torn down mid-resize */
        }
      });
      observer.observe(hostRef.current);
    })();

    return () => {
      cancelled = true;
      observer?.disconnect();
      try {
        viewerRef.current?.clear();
      } catch {
        /* already gone */
      }
      viewerRef.current = null;
    };
    // Rebuild the viewer when the structure changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sdf]);

  // Restyle in place when only the representation changes.
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    viewer.setStyle({}, styleFor(representation));
    viewer.render();
  }, [representation]);

  return <div ref={hostRef} className="absolute inset-0" />;
}
