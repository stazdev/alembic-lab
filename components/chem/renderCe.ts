import katex from "katex";
import "katex/contrib/mhchem";

/**
 * Render an mhchem `\ce{…}` string to KaTeX HTML. Isomorphic (KaTeX's
 * renderToString runs on server and client), so the chem-notation components
 * stay SSR-friendly. `throwOnError: false` degrades to a visible error node
 * rather than crashing the render.
 */
export function renderCe(ce: string): string {
  return katex.renderToString(ce, { throwOnError: false, output: "html" });
}
