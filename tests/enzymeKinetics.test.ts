import { describe, it, expect } from "vitest";
import {
  michaelisMenten,
  rateFraction,
  lineweaverBurkFit,
} from "@/lib/chemistry/enzymeKinetics";

describe("Michaelis–Menten", () => {
  it("gives half Vmax when [S] = Km", () => {
    expect(michaelisMenten(100, 5, 5)).toBeCloseTo(50, 6);
  });

  it("approaches Vmax as [S] >> Km", () => {
    expect(michaelisMenten(100, 5, 5000)).toBeGreaterThan(99);
    expect(michaelisMenten(100, 5, 5000)).toBeLessThanOrEqual(100);
  });

  it("rate fraction is 0.5 at Km and 0.75 at 3·Km", () => {
    expect(rateFraction(4, 4)).toBeCloseTo(0.5, 6);
    expect(rateFraction(4, 12)).toBeCloseTo(0.75, 6);
  });
});

describe("Lineweaver–Burk fit", () => {
  it("recovers Vmax and Km from exact Michaelis–Menten data", () => {
    const vmax = 100;
    const km = 5;
    const pts = [1, 2, 5, 10, 20].map((s) => ({
      s,
      v: michaelisMenten(vmax, km, s),
    }));
    const fit = lineweaverBurkFit(pts);
    expect(fit.ok).toBe(true);
    if (fit.ok) {
      expect(fit.vmax).toBeCloseTo(100, 4);
      expect(fit.km).toBeCloseTo(5, 4);
      expect(fit.r2).toBeCloseTo(1, 6);
    }
  });

  it("rejects insufficient data", () => {
    expect(lineweaverBurkFit([{ s: 1, v: 1 }]).ok).toBe(false);
  });
});
