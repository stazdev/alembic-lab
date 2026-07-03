import { describe, it, expect } from "vitest";
import { redoxTitrationConcentration } from "@/lib/chemistry/redoxTitration";

describe("redox titration", () => {
  it("KMnO₄ vs Fe²⁺: 20.0 mL of 0.0200 M titrates 25.0 mL Fe²⁺ → 0.0800 M", () => {
    expect(
      redoxTitrationConcentration({
        cTitrant: 0.02,
        vTitrant: 20,
        nTitrant: 5,
        vAnalyte: 25,
        nAnalyte: 1,
      }),
    ).toBeCloseTo(0.08, 4);
  });

  it("balances electrons at the equivalence point", () => {
    const c = redoxTitrationConcentration({
      cTitrant: 0.02,
      vTitrant: 20,
      nTitrant: 5,
      vAnalyte: 25,
      nAnalyte: 1,
    });
    expect(0.02 * 20 * 5).toBeCloseTo(c * 25 * 1, 6);
  });

  it("accounts for analyte electron count (oxalate loses 2e⁻)", () => {
    expect(
      redoxTitrationConcentration({
        cTitrant: 0.02,
        vTitrant: 20,
        nTitrant: 5,
        vAnalyte: 25,
        nAnalyte: 2,
      }),
    ).toBeCloseTo(0.04, 4);
  });
});
