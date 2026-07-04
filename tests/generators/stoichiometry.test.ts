import { describe, it, expect } from "vitest";
import { molarMass } from "@/lib/chemistry/stoichiometry";
import { realize } from "@/lib/chemistry/generators/types";
import { molarMassGen } from "@/lib/chemistry/generators/stoichiometry";
import { checkGenerator } from "./harness";

describe("molar-mass generator", () => {
  it("satisfies the generic generator invariants", () => {
    checkGenerator(molarMassGen, { seeds: 400, numeric: { min: 15, max: 400 } });
  });

  it("answer always recomputes from the given formula (grading can't drift)", () => {
    for (const difficulty of molarMassGen.difficulties) {
      for (let seed = 1; seed <= 400; seed++) {
        const t = realize(molarMassGen, seed, difficulty);
        const formula = t.given?.find((g) => g.label === "Formula")?.value;
        expect(formula).toBeTruthy();

        const r = molarMass(formula!);
        expect(r.ok).toBe(true);
        if (r.ok && t.answer.kind === "numeric") {
          // The keyed answer is exactly the engine's molar mass.
          expect(r.value.molarMass).toBeCloseTo(t.answer.value, 6);
          // The worked solution states the same number it grades against.
          expect(t.solution).toContain(t.answer.value.toFixed(2));
        }
      }
    }
  });
});
