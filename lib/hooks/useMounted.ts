import { useEffect, useState } from "react";

/**
 * True only after the first client render. Gate reads of persisted (localStorage)
 * store state behind this so SSR and the first client render agree, avoiding a
 * hydration mismatch — the persisted value isn't available until after mount.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
