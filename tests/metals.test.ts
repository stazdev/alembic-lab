import { describe, it, expect } from "vitest";
import { resolveMixture, type MixtureComponent } from "@/lib/chemistry/resolve";

const c = (reagentId: string, amountMl: number): MixtureComponent => ({
  reagentId,
  amountMl,
});
const has = (r: ReturnType<typeof resolveMixture>, id: string) =>
  r.appearance.observables.some((o) => o.id === id);

describe("reactive metals (reactivity series)", () => {
  it("magnesium + acid evolves hydrogen and releases heat", () => {
    const r = resolveMixture([c("mg", 10), c("hcl", 25)], 22);
    expect(r.appearance.gasRate).toBeGreaterThan(0);
    expect(r.heatKJ).toBeGreaterThan(0);
    expect(has(r, "mg-hcl")).toBe(true);
  });

  it("sodium + water turns the solution alkaline and fizzes", () => {
    const r = resolveMixture([c("na", 6), c("water", 40)], 22);
    expect(r.appearance.gasRate).toBeGreaterThan(0);
    expect(r.pH).not.toBeNull();
    expect(r.pH!).toBeGreaterThan(9);
    expect(has(r, "na-water")).toBe(true);
  });

  it("copper does NOT react with dilute acid", () => {
    const r = resolveMixture([c("cu", 10), c("hcl", 25)], 22);
    expect(has(r, "cu-inert")).toBe(true);
    expect(r.appearance.observables.some((o) => o.kind === "gas")).toBe(false);
    expect(r.heatKJ).toBe(0);
  });
});
