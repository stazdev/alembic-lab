import { describe, it, expect } from "vitest";
import {
  molarMass,
  solveDilution,
  solveLimiting,
} from "@/lib/chemistry/stoichiometry";

const mm = (f: string): number => {
  const r = molarMass(f);
  return r.ok ? r.value.molarMass : NaN;
};

describe("molarMass", () => {
  it("water", () => expect(mm("H2O")).toBeCloseTo(18.015, 2));
  it("glucose", () => expect(mm("C6H12O6")).toBeCloseTo(180.156, 2));
  it("copper(II) sulfate", () => expect(mm("CuSO4")).toBeCloseTo(159.602, 2));
  it("iron(III) sulfate", () => expect(mm("Fe2(SO4)3")).toBeCloseTo(399.86, 1));
});

describe("solveDilution (C1V1 = C2V2)", () => {
  it("solves the blank field", () => {
    const r = solveDilution(2, null, 0.5, 1);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.solved).toBe("v1");
    expect(r.value.v1).toBeCloseTo(0.25, 4);
  });
  it("requires exactly three known values", () =>
    expect(solveDilution(2, null, null, 1).ok).toBe(false));
});

describe("solveLimiting", () => {
  it("2H2 + O2 -> 2H2O with 4 g H2 and 32 g O2", () => {
    const r = solveLimiting(
      [
        { formula: "H2", coeff: 2, grams: 4 },
        { formula: "O2", coeff: 1, grams: 32 },
      ],
      [{ formula: "H2O", coeff: 2 }],
    );
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.limiting).toBe("H2");
    const water = r.value.products.find((p) => p.formula === "H2O");
    expect(water?.grams).toBeCloseTo(35.74, 1);
    const o2 = r.value.reactants.find((x) => x.formula === "O2");
    expect(o2?.molesRemaining).toBeGreaterThan(0);
  });
});
