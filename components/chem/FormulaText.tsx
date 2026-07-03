/**
 * Renders a neutral chemical formula with proper subscripts (§3.3 chem layer).
 * Digit runs become <sub> (H2O → H₂O). A lightweight stand-in for the planned
 * KaTeX/mhchem <ChemFormula>; good enough for editor + ledger display.
 */
interface FormulaTextProps {
  formula: string;
  className?: string;
}

export function FormulaText({ formula, className }: FormulaTextProps) {
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
    </span>
  );
}
