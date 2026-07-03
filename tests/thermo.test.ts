import { describe, it, expect } from "vitest";
import {
  reactionThermo,
  gibbs,
  kFromDG,
  dGFromK,
  type ThermoTerm,
} from "@/lib/chemistry/thermo";
import { THERMO_BY_ID } from "@/data/thermoData";

const term = (id: string, coeff: number): ThermoTerm => {
  const s = THERMO_BY_ID[id];
  return { dHf: s.dHf, s: s.s, coeff };
};

describe("reactionThermo (Hess's law)", () => {
  it("methane combustion", () => {
    const r = reactionThermo(
      [term("CH4(g)", 1), term("O2(g)", 2)],
      [term("CO2(g)", 1), term("H2O(l)", 2)],
    );
    expect(r.dH).toBeCloseTo(-890.5, 1);
    expect(r.dS).toBeCloseTo(-243.1, 1);
    expect(r.dG).toBeCloseTo(-818, 0);
    expect(r.spontaneous).toBe(true);
  });

  it("Haber process is spontaneous at 298 K with large K", () => {
    const r = reactionThermo(
      [term("N2(g)", 1), term("H2(g)", 3)],
      [term("NH3(g)", 2)],
    );
    expect(r.dH).toBeCloseTo(-91.8, 1);
    expect(r.spontaneous).toBe(true);
    expect(Math.log10(r.K)).toBeGreaterThan(4);
  });
});

describe("gibbs & equilibrium constant", () => {
  it("gibbs relation", () =>
    expect(gibbs(-91.8, -198.1, 298.15)).toBeCloseTo(-32.7, 0));
  it("dG -> K -> dG round trip", () =>
    expect(dGFromK(kFromDG(-25, 298.15), 298.15)).toBeCloseTo(-25, 2));
});
