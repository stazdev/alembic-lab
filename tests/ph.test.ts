import { describe, it, expect } from "vitest";
import {
  strongAcidPH,
  strongBasePH,
  weakAcidPH,
  weakBasePH,
  bufferPH,
  pKaToKa,
  titrateAcidWithBase,
  titrateBaseWithAcid,
} from "@/lib/chemistry/ph";

describe("point pH", () => {
  it("strong acid 0.1 M", () => expect(strongAcidPH(0.1)).toBeCloseTo(1.0, 2));
  it("strong base 0.01 M", () => expect(strongBasePH(0.01)).toBeCloseTo(12.0, 2));
  it("weak acid (acetic, 0.1 M)", () =>
    expect(weakAcidPH(0.1, pKaToKa(4.76))).toBeCloseTo(2.87, 1));
  it("weak base (ammonia, 0.1 M)", () =>
    expect(weakBasePH(0.1, pKaToKa(4.75))).toBeCloseTo(11.12, 1));
  it("buffer (Henderson–Hasselbalch)", () =>
    expect(bufferPH(4.76, 0.1, 0.1)).toBeCloseTo(4.76, 2));
});

describe("titration curves", () => {
  it("strong acid with strong base: equivalence at pH 7", () => {
    const t = titrateAcidWithBase({
      analyteConc: 0.1,
      analyteVol: 25,
      pK: null,
      titrantConc: 0.1,
    });
    expect(t.equivalenceVolume).toBeCloseTo(25, 1);
    expect(t.equivalencePH).toBeCloseTo(7, 1);
    expect(t.points[0].ph).toBeCloseTo(1, 1);
  });

  it("weak acid with strong base: half-equivalence = pKa, equivalence basic", () => {
    const t = titrateAcidWithBase({
      analyteConc: 0.1,
      analyteVol: 25,
      pK: 4.76,
      titrantConc: 0.1,
    });
    expect(t.halfEquivalencePH).toBeCloseTo(4.76, 1);
    expect(t.equivalencePH).toBeGreaterThan(7);
  });

  it("weak base with strong acid: equivalence acidic", () => {
    const t = titrateBaseWithAcid({
      analyteConc: 0.1,
      analyteVol: 25,
      pK: 4.75,
      titrantConc: 0.1,
    });
    expect(t.equivalencePH).toBeLessThan(7);
  });
});
