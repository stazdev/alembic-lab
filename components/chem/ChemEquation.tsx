import { cn } from "@/lib/utils";
import { renderCe } from "./renderCe";

export interface ChemTerm {
  coeff?: number;
  formula: string;
  charge?: number;
  state?: string; // s | l | g | aq
}

const STATE_WORD: Record<string, string> = {
  s: "solid",
  l: "liquid",
  g: "gas",
  aq: "aqueous",
};

function termToCe(t: ChemTerm): string {
  const coeff = t.coeff && t.coeff !== 1 ? String(t.coeff) : "";
  const charge = t.charge
    ? `^{${Math.abs(t.charge)}${t.charge > 0 ? "+" : "-"}}`
    : "";
  const state = t.state ? `(${t.state})` : "";
  return `${coeff}${t.formula}${charge}${state}`;
}

function termLabel(t: ChemTerm): string {
  const coeff = t.coeff && t.coeff !== 1 ? `${t.coeff} ` : "";
  const charge = t.charge
    ? ` ${Math.abs(t.charge)} ${t.charge > 0 ? "plus" : "minus"}`
    : "";
  const state = t.state ? ` ${STATE_WORD[t.state] ?? t.state}` : "";
  return `${coeff}${t.formula}${charge}${state}`;
}

interface ChemEquationProps {
  reactants: ChemTerm[];
  products: ChemTerm[];
  arrow?: "yields" | "equilibrium";
  className?: string;
  ariaLabel?: string;
}

/**
 * Renders a full chemical equation — coefficients, subscripted formulas, ionic
 * charges, physical states, and the reaction arrow — typeset with KaTeX + mhchem
 * (§3.3). Carries a plain-language `aria-label` so a screen reader hears the
 * chemistry, not a symbol blob. The interactive balancers keep their editable
 * layout; this is for static display.
 */
export function ChemEquation({
  reactants,
  products,
  arrow = "yields",
  className,
  ariaLabel,
}: ChemEquationProps) {
  const arrowCe = arrow === "equilibrium" ? "<=>" : "->";
  const ce = `\\ce{${reactants.map(termToCe).join(" + ")} ${arrowCe} ${products
    .map(termToCe)
    .join(" + ")}}`;
  const html = renderCe(ce);

  const arrowWord = arrow === "equilibrium" ? "in equilibrium with" : "yields";
  const label =
    ariaLabel ??
    `${reactants.map(termLabel).join(" plus ")} ${arrowWord} ${products
      .map(termLabel)
      .join(" plus ")}`;

  return (
    <span
      role="img"
      aria-label={label}
      className={cn("inline-block align-middle", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
