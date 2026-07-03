import { describe, it, expect } from "vitest";
import { solveIdeal, solveCombined } from "@/lib/chemistry/gasLaws";

describe("ideal gas law", () => {
  it("solves for volume — 1 mol at STP is ~22.41 L", () => {
    const r = solveIdeal({ P: 1, n: 1, T: 273.15 });
    expect(r.ok && r.solvedFor).toBe("V");
    expect(r.ok && r.value).toBeCloseTo(22.414, 2);
  });

  it("solves for moles from P, V, T", () => {
    const r = solveIdeal({ P: 1, V: 22.414, T: 273.15 });
    expect(r.ok && r.value).toBeCloseTo(1.0, 3);
  });

  it("solves for pressure", () => {
    const r = solveIdeal({ V: 2, n: 0.5, T: 300 });
    // P = nRT/V = 0.5 * 0.0820573 * 300 / 2
    expect(r.ok && r.value).toBeCloseTo(6.154, 2);
  });

  it("requires exactly one unknown", () => {
    expect(solveIdeal({ P: 1, V: 2 }).ok).toBe(false);
    expect(solveIdeal({ P: 1, V: 2, n: 1, T: 300 }).ok).toBe(false);
  });

  it("rejects non-positive inputs", () => {
    expect(solveIdeal({ P: -1, V: 2, n: 1 }).ok).toBe(false);
  });
});

describe("combined gas law", () => {
  it("Boyle's law: halving volume at constant T doubles pressure", () => {
    const r = solveCombined({ P1: 1, V1: 2, T1: 300, V2: 1, T2: 300 });
    expect(r.ok && r.solvedFor).toBe("P2");
    expect(r.ok && r.value).toBeCloseTo(2, 6);
  });

  it("Charles's law: doubling T at constant P doubles volume", () => {
    const r = solveCombined({ P1: 1, V1: 2, T1: 300, P2: 1, T2: 600 });
    expect(r.ok && r.solvedFor).toBe("V2");
    expect(r.ok && r.value).toBeCloseTo(4, 6);
  });

  it("solves for a final temperature", () => {
    const r = solveCombined({ P1: 1, V1: 1, T1: 300, P2: 2, V2: 1 });
    // T2 = P2 V2 T1 / (P1 V1) = 2*1*300/(1*1) = 600
    expect(r.ok && r.value).toBeCloseTo(600, 6);
  });

  it("requires exactly five values", () => {
    expect(solveCombined({ P1: 1, V1: 2, T1: 300 }).ok).toBe(false);
  });
});
