import { describe, it, expect } from "vitest";
import {
  rate,
  halfLife,
  concentrationAtTime,
  arrheniusK,
  activationEnergy,
} from "@/lib/chemistry/kinetics";

describe("kinetics", () => {
  it("rate law: k[A][B]^2", () =>
    expect(rate(0.5, [{ conc: 2, order: 1 }, { conc: 3, order: 2 }])).toBe(9));

  it("first-order half-life is ln2/k", () =>
    expect(halfLife(1, 0.1, 1)).toBeCloseTo(Math.LN2 / 0.1, 3));

  it("first-order concentration halves at the half-life", () =>
    expect(concentrationAtTime(1, 0.1, 1, Math.LN2 / 0.1)).toBeCloseTo(0.5, 3));

  it("zero-order clamps at zero", () =>
    expect(concentrationAtTime(2, 0.1, 0, 1000)).toBe(0));

  it("Arrhenius k from A, Ea, T", () =>
    expect(arrheniusK(1e13, 75, 298)).toBeCloseTo(0.71, 1));

  it("activation energy from two (k, T) points", () =>
    expect(activationEnergy(1, 300.15, 2, 310.15)).toBeCloseTo(53.6, 0));
});
