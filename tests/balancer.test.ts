import { describe, it, expect } from "vitest";
import {
  parseFormula,
  balanceEquation,
  parseIon,
  balanceRedox,
  type RedoxTerm,
} from "@/lib/chemistry/balancer";

describe("parseFormula", () => {
  it("parses nested groups and subscripts", () => {
    expect(parseFormula("Fe2(SO4)3").counts).toEqual({ Fe: 2, S: 3, O: 12 });
    expect(parseFormula("Ca(OH)2").counts).toEqual({ Ca: 1, O: 2, H: 2 });
  });
  it("flags malformed input", () => {
    expect(parseFormula("").error).toBeTruthy();
  });
});

describe("balanceEquation (molecular)", () => {
  const coeffs = (r: string[], p: string[]) => {
    const res = balanceEquation(r, p);
    return res.ok ? res.coefficients : null;
  };

  it("water synthesis", () => expect(coeffs(["H2", "O2"], ["H2O"])).toEqual([2, 1, 2]));
  it("propane combustion", () =>
    expect(coeffs(["C3H8", "O2"], ["CO2", "H2O"])).toEqual([1, 5, 3, 4]));
  it("permanganate + HCl (redox, molecular form)", () =>
    expect(coeffs(["KMnO4", "HCl"], ["KCl", "MnCl2", "H2O", "Cl2"])).toEqual([
      2, 16, 2, 2, 8, 5,
    ]));
  it("rejects an unbalanceable equation", () =>
    expect(balanceEquation(["Na", "O2"], ["NaCl"]).ok).toBe(false));
});

describe("parseIon", () => {
  it("reads a single trailing charge", () => {
    const p = parseIon("MnO4-");
    expect(p.formula).toBe("MnO4");
    expect(p.charge).toBe(-1);
  });
  it("reads a caret charge of magnitude > 1", () => {
    expect(parseIon("Cr2O7^2-").charge).toBe(-2);
    expect(parseIon("Fe^3+").charge).toBe(3);
  });
});

describe("balanceRedox", () => {
  const coeff = (side: RedoxTerm[], formula: string, charge: number) =>
    side.find((t) => t.formula === formula && t.charge === charge)?.coeff;

  it("permanganate + iron in acid", () => {
    const r = balanceRedox(["MnO4-", "Fe^2+"], ["Mn^2+", "Fe^3+"], "acidic");
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(coeff(r.left, "MnO4", -1)).toBe(1);
    expect(coeff(r.left, "Fe", 2)).toBe(5);
    expect(coeff(r.left, "H", 1)).toBe(8);
    expect(coeff(r.right, "Mn", 2)).toBe(1);
    expect(coeff(r.right, "H2O", 0)).toBe(4);
  });

  it("permanganate + sulfite in base", () => {
    const r = balanceRedox(["MnO4-", "SO3^2-"], ["MnO2", "SO4^2-"], "basic");
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(coeff(r.left, "MnO4", -1)).toBe(2);
    expect(coeff(r.left, "H2O", 0)).toBe(1);
    expect(coeff(r.right, "OH", -1)).toBe(2);
  });
});
