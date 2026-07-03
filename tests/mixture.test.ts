import { describe, it, expect } from "vitest";
import { resolveMixture, type MixtureComponent } from "@/lib/chemistry/resolve";

const c = (reagentId: string, amountMl: number): MixtureComponent => ({
  reagentId,
  amountMl,
});
const phOf = (comps: MixtureComponent[]): number =>
  resolveMixture(comps, 22).pH ?? NaN;

describe("mixture pH", () => {
  it("HCl + NaOH (equal) is neutral", () =>
    expect(phOf([c("hcl", 25), c("naoh", 25)])).toBeCloseTo(7, 1));
  it("excess HCl is strongly acidic", () =>
    expect(phOf([c("hcl", 50), c("naoh", 25)])).toBeLessThan(1.5));
  it("excess NaOH is strongly basic", () =>
    expect(phOf([c("hcl", 25), c("naoh", 50)])).toBeGreaterThan(12.5));
  it("ammonia is weakly basic", () => {
    const p = phOf([c("ammonia", 25), c("water", 25)]);
    expect(p).toBeGreaterThan(10.5);
    expect(p).toBeLessThan(12);
  });
  it("plain water is neutral", () =>
    expect(phOf([c("water", 40)])).toBeCloseTo(7, 1));
});

describe("mixture reactions", () => {
  it("neutralisation releases heat", () =>
    expect(resolveMixture([c("hcl", 25), c("naoh", 25)], 22).heatKJ).toBeGreaterThan(1));
  it("water alone releases no heat", () =>
    expect(resolveMixture([c("water", 40)], 22).heatKJ).toBe(0));
  it("AgNO3 + NaCl forms a white precipitate", () => {
    const r = resolveMixture([c("agno3", 25), c("nacl", 25)], 22);
    expect(r.appearance.precipitate?.color).toBe("#eef0ee");
  });
  it("phenolphthalein is pink in base, colourless in acid", () => {
    const inBase = resolveMixture(
      [c("naoh", 25), c("phenolphthalein", 5), c("water", 20)],
      22,
    );
    const inAcid = resolveMixture(
      [c("hcl", 25), c("phenolphthalein", 5), c("water", 20)],
      22,
    );
    const pink = (r: ReturnType<typeof resolveMixture>) =>
      r.appearance.observables.some((o) => o.id === "ind-phph");
    expect(pink(inBase)).toBe(true);
    expect(pink(inAcid)).toBe(false);
  });
});
