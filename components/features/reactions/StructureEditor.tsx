"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

// Kekulé.js is a ~2.7MB browser bundle loaded once via a script tag (only when
// this tool is opened). It exposes the global `Kekule`, whose Composer editor
// supports structure drawing and curved electron-pushing arrows.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let kekulePromise: Promise<any> | null = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function loadKekule(): Promise<any> {
  if (kekulePromise) return kekulePromise;
  kekulePromise = new Promise((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    if (w.Kekule) return resolve(w.Kekule);

    if (!document.getElementById("kekule-css")) {
      const link = document.createElement("link");
      link.id = "kekule-css";
      link.rel = "stylesheet";
      link.href = "/kekule/themes/default/kekule.css";
      document.head.appendChild(link);
    }

    const ready = () =>
      w.Kekule ? resolve(w.Kekule) : reject(new Error("Kekulé unavailable"));
    const existing = document.getElementById("kekule-js");
    if (existing) {
      existing.addEventListener("load", ready);
      existing.addEventListener("error", () => reject(new Error("Kekulé error")));
      return;
    }
    const script = document.createElement("script");
    script.id = "kekule-js";
    script.src = "/kekule/kekule.min.js";
    script.async = true;
    script.onload = ready;
    script.onerror = () => reject(new Error("Kekulé error"));
    document.head.appendChild(script);
  });
  return kekulePromise;
}

/**
 * Interactive structure editor (Kekulé.js Composer) — draw reactants and push
 * curved electron arrows to sketch a mechanism yourself. Client-only.
 */
export function StructureEditor() {
  const hostRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const composerRef = useRef<any>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    loadKekule()
      .then((Kekule) => {
        if (cancelled || !hostRef.current || composerRef.current) return;
        try {
          const composer = new Kekule.Editor.Composer(hostRef.current);
          try {
            composer.setPredefinedSetting("fullFunc");
          } catch {
            /* default toolset is already full */
          }
          try {
            composer.setDimension("100%", "480px");
          } catch {
            /* fall back to container sizing */
          }
          composerRef.current = composer;
          setStatus("ready");
        } catch {
          setStatus("error");
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
      try {
        composerRef.current?.finalize?.();
      } catch {
        /* already torn down */
      }
      composerRef.current = null;
    };
  }, []);

  return (
    <div className="space-y-3">
      <p className="text-xs text-ink-2">
        Draw structures atom-by-atom or from templates, then use the arrow/glyph
        tools to add curved electron-pushing arrows — sketch a mechanism yourself.
      </p>
      <div className="relative min-h-[480px] overflow-hidden rounded-card border border-line bg-surface">
        <div ref={hostRef} className="h-[480px] w-full" />
        {status !== "ready" && (
          <div className="absolute inset-0 grid place-items-center bg-surface">
            {status === "loading" ? (
              <Loader2 className="h-5 w-5 animate-spin text-ink-3" />
            ) : (
              <span className="px-4 text-center text-xs text-ink-3">
                Couldn&apos;t load the structure editor.
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
