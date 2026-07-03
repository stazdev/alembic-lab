import { describe, it, expect } from "vitest";
import {
  molarSolubility,
  kspFromSolubility,
  leChatelier,
  type Equilibrium,
} from "@/lib/chemistry/equilibrium";

describe("solubility from Ksp", () => {
  it("1:1 salt: s = √Ksp", () => {
    expect(molarSolubility(1.8e-10, 1, 1)).toBeCloseTo(Math.sqrt(1.8e-10), 12);
  });

  it("1:2 salt (CaF₂): s = ∛(Ksp/4)", () => {
    expect(molarSolubility(3.9e-11, 1, 2)).toBeCloseTo(Math.cbrt(3.9e-11 / 4), 12);
  });

  it("round-trips Ksp ⇄ s", () => {
    const s = molarSolubility(7.1e-9, 1, 2);
    expect(kspFromSolubility(s, 1, 2)).toBeCloseTo(7.1e-9, 12);
  });

  it("rejects invalid input", () => {
    expect(Number.isNaN(molarSolubility(0, 1, 1))).toBe(true);
  });
});

describe("Le Chatelier", () => {
  const haber: Equilibrium = { deltaNgas: -2, exothermic: true };

  it("adding reactant shifts right", () => {
    expect(leChatelier(haber, "addReactant").shift).toBe("right");
  });
  it("increasing pressure favors fewer gas moles (right for Haber)", () => {
    expect(leChatelier(haber, "increasePressure").shift).toBe("right");
  });
  it("heating an exothermic reaction shifts left", () => {
    expect(leChatelier(haber, "increaseTemp").shift).toBe("left");
  });
  it("pressure has no effect when Δn(gas) = 0", () => {
    expect(
      leChatelier({ deltaNgas: 0, exothermic: true }, "increasePressure").shift,
    ).toBe("none");
  });
  it("a catalyst causes no shift", () => {
    expect(leChatelier(haber, "catalyst").shift).toBe("none");
  });
  it("heating an endothermic reaction shifts right", () => {
    expect(
      leChatelier({ deltaNgas: 1, exothermic: false }, "increaseTemp").shift,
    ).toBe("right");
  });
});
