import { describe, it, expect } from "vitest";
import { resolveMixture, type MixtureComponent } from "@/lib/chemistry/resolve";

const c = (reagentId: string, amountMl: number): MixtureComponent => ({
  reagentId,
  amountMl,
});
const has = (r: ReturnType<typeof resolveMixture>, id: string) =>
  r.appearance.observables.some((o) => o.id === id);
const hasKind = (r: ReturnType<typeof resolveMixture>, kind: string) =>
  r.appearance.observables.some((o) => o.kind === kind);

describe("reactive metals (activity series)", () => {
  it("magnesium + acid evolves hydrogen and releases heat", () => {
    const r = resolveMixture([c("mg", 10), c("hcl", 25)], 22);
    expect(r.appearance.gasRate).toBeGreaterThan(0);
    expect(r.heatKJ).toBeGreaterThan(0);
    expect(has(r, "metal-acid-Mg")).toBe(true);
  });

  it("sodium + water turns the solution alkaline and fizzes", () => {
    const r = resolveMixture([c("na", 6), c("water", 40)], 22);
    expect(r.appearance.gasRate).toBeGreaterThan(0);
    expect(r.pH).not.toBeNull();
    expect(r.pH!).toBeGreaterThan(9);
    expect(has(r, "metal-water-Na")).toBe(true);
  });

  it("newly-added metals also react: potassium with water, aluminium with acid", () => {
    const k = resolveMixture([c("k", 5), c("water", 40)], 22);
    expect(has(k, "metal-water-K")).toBe(true);
    expect(k.pH!).toBeGreaterThan(9);

    const al = resolveMixture([c("al", 10), c("hcl", 25)], 22);
    expect(has(al, "metal-acid-Al")).toBe(true);
    expect(al.appearance.gasRate).toBeGreaterThan(0);
  });

  it("copper does NOT react with dilute acid", () => {
    const r = resolveMixture([c("cu", 10), c("hcl", 25)], 22);
    expect(has(r, "cu-inert")).toBe(true);
    expect(hasKind(r, "gas")).toBe(false);
    expect(r.heatKJ).toBe(0);
  });

  it("metal displacement: zinc displaces copper from copper(II) sulfate", () => {
    const r = resolveMixture([c("zn", 10), c("cuso4", 25)], 22);
    expect(has(r, "displace-Zn-Cu")).toBe(true);
  });

  it("less-reactive metal does NOT displace: copper does not displace zinc", () => {
    const r = resolveMixture([c("cu", 10), c("znso4", 25)], 22);
    expect(has(r, "displace-Cu-Zn")).toBe(false);
  });
});

describe("general precipitation (solubility rules, not a fixed list)", () => {
  it("silver nitrate + potassium iodide → silver iodide", () => {
    const r = resolveMixture([c("agno3", 25), c("ki", 25)], 22);
    expect(r.appearance.precipitate).not.toBeNull();
    expect(has(r, "precip-Ag+-I-")).toBe(true);
  });

  it("copper(II) sulfate + NaOH → copper(II) hydroxide precipitate (blue)", () => {
    const r = resolveMixture([c("cuso4", 25), c("naoh", 25)], 22);
    expect(r.appearance.precipitate?.color).toBe("#2b73b8");
    expect(has(r, "precip-Cu2+-OH-")).toBe(true);
  });

  it("barium chloride + sulfuric acid → barium sulfate", () => {
    const r = resolveMixture([c("bacl2", 20), c("h2so4", 20)], 22);
    expect(has(r, "precip-Ba2+-SO4^2-")).toBe(true);
  });

  it("spectator-only salts do NOT precipitate (NaCl + KNO₃)", () => {
    const r = resolveMixture([c("nacl", 25), c("kno3", 25)], 22);
    expect(r.appearance.precipitate).toBeNull();
  });
});

describe("gas evolution", () => {
  it("carbonate + acid fizzes CO₂", () => {
    const r = resolveMixture([c("na2co3", 25), c("hcl", 25)], 22);
    expect(has(r, "gas-co2-carbonate")).toBe(true);
    expect(r.appearance.gasRate).toBeGreaterThan(0);
  });
  it("ammonium salt + strong base releases ammonia", () => {
    const r = resolveMixture([c("nh4cl", 25), c("naoh", 25)], 22);
    expect(has(r, "gas-nh3")).toBe(true);
  });
});

describe("complex ions", () => {
  it("copper(II) + excess ammonia → deep-blue complex", () => {
    const r = resolveMixture([c("cuso4", 20), c("ammonia", 50)], 22);
    expect(has(r, "complex-cuammine")).toBe(true);
  });
});
