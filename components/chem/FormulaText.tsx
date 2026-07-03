/**
 * Renders a chemical formula with proper subscripts and (optional) an ionic
 * charge superscript (§3.3 chem layer). Digit runs become <sub> (H2O → H₂O);
 * a non-zero `charge` becomes a superscript (SO4 + −2 → SO₄²⁻). A lightweight
 * stand-in for the planned KaTeX/mhchem <ChemFormula>.
 */
interface FormulaTextProps {
  formula: string;
  charge?: number;
  className?: string;
}

export function FormulaText({ formula, charge, className }: FormulaTextProps) {
  const tokens = formula.match(/\d+|[^\d]+/g) ?? [];
  return (
    <span className={className}>
      {tokens.map((token, i) =>
        /^\d+$/.test(token) ? (
          <sub key={i} className="text-[0.7em]">
            {token}
          </sub>
        ) : (
          <span key={i}>{token}</span>
        ),
      )}
      {charge != null && charge !== 0 && (
        <sup className="text-[0.7em]">
          {Math.abs(charge) > 1 ? Math.abs(charge) : ""}
          {charge > 0 ? "+" : "−"}
        </sup>
      )}
    </span>
  );
}
