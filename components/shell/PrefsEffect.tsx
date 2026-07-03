"use client";

import { useEffect } from "react";
import { usePrefs } from "@/lib/stores/prefsStore";

/** Applies the "reduce motion" preference as a class on <html> (§4.4 a11y). */
export function PrefsEffect() {
  const reduceMotion = usePrefs((s) => s.reduceMotion);
  useEffect(() => {
    document.documentElement.classList.toggle("reduce-motion", reduceMotion);
  }, [reduceMotion]);
  return null;
}
