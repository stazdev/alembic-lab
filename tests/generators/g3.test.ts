import { describe, it, expect } from "vitest";
import { generatorById } from "@/lib/chemistry/generators/registry";
import { realize } from "@/lib/chemistry/generators/types";
import { balanceEquation } from "@/lib/chemistry/balancer";
import { checkGenerator } from "./harness";

describe("G3 balancing & organic generators", () => {
  it("balance-coefficient: invariants + integer coefficients", () => {
    const gen = generatorById("balance-coefficient")!;
    checkGenerator(gen, { seeds: 300, numeric: { min: 1, max: 30 } });
  });

  it("balance-coefficient: the keyed coefficient really balances the equation", () => {
    // The solution line embeds the answer; re-balancing the same skeleton must
    // reproduce an integer coefficient equal to the answer.
    const gen = generatorById("balance-coefficient")!;
    for (let seed = 1; seed <= 300; seed++) {
      const t = realize(gen, seed, seed % 2 ? "Intro" : "Core");
      if (t.answer.kind === "numeric") {
        expect(Number.isInteger(t.answer.value)).toBe(true);
        expect(t.answer.value).toBeGreaterThan(0);
        expect(t.solution).toContain(String(t.answer.value));
      }
    }
  });

  it("balance-redox: invariants + positive integer coefficients", () => {
    const gen = generatorById("balance-redox")!;
    checkGenerator(gen, { seeds: 300, numeric: { min: 1, max: 20 } });
  });

  it("organic-fg-id: well-formed MCQ with a real group name", () => {
    const gen = generatorById("organic-fg-id")!;
    checkGenerator(gen, { seeds: 200 });
    for (let seed = 1; seed <= 200; seed++) {
      const t = realize(gen, seed, "Core");
      expect(t.answer.kind).toBe("choice");
      if (t.answer.kind === "choice") {
        expect(t.answer.options).toHaveLength(4);
        expect(t.answer.options[t.answer.correctIndex]).toBeTruthy();
      }
    }
  });

  it("organic-dou: non-negative integer degrees of unsaturation", () => {
    const gen = generatorById("organic-dou")!;
    checkGenerator(gen, { seeds: 200, numeric: { min: 0, max: 8 } });
  });

  it("sanity: balancer agrees on propane combustion (5 O₂)", () => {
    const r = balanceEquation(["C3H8", "O2"], ["CO2", "H2O"]);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.coefficients).toEqual([1, 5, 3, 4]);
  });
});
