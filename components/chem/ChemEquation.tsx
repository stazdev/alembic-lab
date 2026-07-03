import { cn } from "@/lib/utils";
import { FormulaText } from "./FormulaText";

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
 * charges, physical states, and the reaction arrow — never as a plain string
 * (§3.3). Built on <FormulaText>, and carries a plain-language aria-label so a
 * screen reader hears the chemistry, not a symbol blob. Reusable wherever a
 * static equation is shown; the interactive balancers keep their editable layout.
 */
export function ChemEquation({
  reactants,
  products,
  arrow = "yields",
  className,
  ariaLabel,
}: ChemEquationProps) {
  const arrowChar = arrow === "equilibrium" ? "⇌" : "→";
  const arrowWord = arrow === "equilibrium" ? "in equilibrium with" : "yields";
  const label =
    ariaLabel ??
    `${reactants.map(termLabel).join(" plus ")} ${arrowWord} ${products
      .map(termLabel)
      .join(" plus ")}`;

  const renderSide = (terms: ChemTerm[]) =>
    terms.map((t, i) => (
      <span key={i} className="inline-flex items-baseline whitespace-nowrap">
        {i > 0 && <span className="mx-1.5 text-ink-3">+</span>}
        {t.coeff != null && t.coeff !== 1 && (
          <span className="mr-0.5 tabular-nums">{t.coeff}</span>
        )}
        <FormulaText formula={t.formula} charge={t.charge} />
        {t.state && <span className="ml-0.5 text-ink-3">({t.state})</span>}
      </span>
    ));

  return (
    <span
      role="img"
      aria-label={label}
      className={cn("inline-flex flex-wrap items-baseline gap-y-1", className)}
    >
      {renderSide(reactants)}
      <span className="mx-2.5 text-ink-3" aria-hidden>
        {arrowChar}
      </span>
      {renderSide(products)}
    </span>
  );
}
