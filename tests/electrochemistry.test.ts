import { describe, it, expect } from "vitest";
import {
  standardCellPotential,
  nernst,
  cellGibbs,
  cellEquilibriumK,
  lcm,
} from "@/lib/chemistry/electrochemistry";
import { HALF_BY_ID } from "@/data/reductionPotentials";

describe("electrochemistry", () => {
  it("Daniell cell (Cu cathode, Zn anode) is +1.10 V", () => {
    expect(
      standardCellPotential(HALF_BY_ID.Cu.E0, HALF_BY_ID.Zn.E0),
    ).toBeCloseTo(1.1, 2);
  });

  it("Nernst reduces to E° at Q = 1", () => {
    expect(nernst(1.1, 2, 1)).toBeCloseTo(1.1, 6);
  });

  it("Nernst potential drops as Q rises", () => {
    expect(nernst(1.1, 2, 10)).toBeCloseTo(1.0704, 3);
    expect(nernst(1.1, 2, 100)).toBeLessThan(nernst(1.1, 2, 10));
  });

  it("ΔG = −nFE in kJ/mol", () => {
    expect(cellGibbs(2, 1.1)).toBeCloseTo(-212.3, 1);
  });

  it("a positive E° gives a very large K", () => {
    expect(cellEquilibriumK(1.1, 2)).toBeGreaterThan(1e30);
  });

  it("electron count is the LCM of the half-reactions", () => {
    expect(lcm(2, 3)).toBe(6);
    expect(lcm(2, 1)).toBe(2);
    expect(lcm(2, 2)).toBe(2);
  });
});
