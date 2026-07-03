import { cn } from "@/lib/utils";
import { renderCe } from "./renderCe";

/**
 * Renders a chemical formula with proper subscripts and an optional ionic charge
 * superscript (§3.3), typeset with KaTeX + mhchem (`\ce{…}`). Handles nested
 * groups, charges, and isotopes correctly. `role="img"` + a plain-language
 * `aria-label` means a screen reader hears "sulfate 2 minus", not glyph soup.
 */
interface FormulaTextProps {
  formula: string;
  charge?: number;
  className?: string;
}

function toCe(formula: string, charge?: number): string {
  let body = formula;
  if (charge != null && charge !== 0) {
    const mag = Math.abs(charge) === 1 ? "" : String(Math.abs(charge));
    body += `^{${mag}${charge > 0 ? "+" : "-"}}`;
  }
  return `\\ce{${body}}`;
}

export function FormulaText({ formula, charge, className }: FormulaTextProps) {
  const html = renderCe(toCe(formula, charge));
  const label =
    charge != null && charge !== 0
      ? `${formula} ${Math.abs(charge)}${charge > 0 ? " plus" : " minus"}`
      : formula;
  return (
    <span
      role="img"
      aria-label={label}
      className={cn("inline-block align-middle", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
