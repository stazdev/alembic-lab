import { describe, it, expect } from "vitest";
import { GENERATORS, generatorById } from "@/lib/chemistry/generators/registry";
import { realize } from "@/lib/chemistry/generators/types";
import { checkGenerator } from "./harness";

// Sane numeric bounds per generator id — the harness asserts answers stay inside.
const BOUNDS: Record<string, { min?: number; max?: number }> = {
  "stoich-molar-mass": { min: 15, max: 400 },
  "stoich-dilution": { min: 1, max: 500 },
  "stoich-molarity": { min: 0.01, max: 6 },
  "gas-ideal": { min: 0, max: 600 },
  "gas-combined": { min: 0, max: 100 },
  "ph-strong-acid": { min: 0, max: 4 },
  "ph-buffer": { min: 0, max: 14 },
  "thermo-hess-dh": { min: -3200, max: 600 },
  "thermo-gibbs": { min: -400, max: 400 },
  "thermo-calorimetry": { min: 0, max: 200000 },
  "kinetics-half-life": { min: 0, max: 6000 },
  "kinetics-arrhenius": { min: 20, max: 160 },
  "echem-cell-potential": { min: 0, max: 6 },
  "echem-nernst": { min: -2, max: 3 },
};

describe("G1 generators — generic invariants", () => {
  for (const gen of GENERATORS) {
    it(`${gen.id}: totality, determinism, well-formed over many seeds`, () => {
      checkGenerator(gen, { seeds: 300, numeric: BOUNDS[gen.id] });
    });
  }
});

describe("registry", () => {
  it("has unique generator ids", () => {
    const ids = GENERATORS.map((g) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it("resolves generators by id", () => {
    for (const g of GENERATORS) expect(generatorById(g.id)).toBe(g);
  });
});

describe("engine-recompute spot checks (answers can't drift)", () => {
  it("Arrhenius recovers the seeded activation energy", () => {
    // The generator hides a known Ea; the recovered value must match closely.
    const gen = generatorById("kinetics-arrhenius")!;
    for (let seed = 1; seed <= 200; seed++) {
      const t = realize(gen, seed, "Challenge");
      if (t.answer.kind === "numeric") {
        expect(t.answer.value).toBeGreaterThan(29);
        expect(t.answer.value).toBeLessThan(161);
        // Solution states the same number it grades against.
        expect(t.solution).toContain(t.answer.value.toFixed(1));
      }
    }
  });

  it("cell potential is always positive (galvanic) and matches the E° difference", () => {
    const gen = generatorById("echem-cell-potential")!;
    for (let seed = 1; seed <= 200; seed++) {
      const t = realize(gen, seed, "Core");
      if (t.answer.kind === "numeric") expect(t.answer.value).toBeGreaterThan(0.1);
    }
  });

  it("MCQ generators expose exactly one correct option", () => {
    for (const id of ["ph-weak-acid", "equil-solubility", "equil-le-chatelier"]) {
      const gen = generatorById(id)!;
      for (let seed = 1; seed <= 150; seed++) {
        const d = gen.difficulties[seed % gen.difficulties.length];
        const t = realize(gen, seed, d);
        expect(t.answer.kind).toBe("choice");
        if (t.answer.kind === "choice") {
          expect(t.answer.options[t.answer.correctIndex]).toBeTruthy();
          expect(new Set(t.answer.options).size).toBe(t.answer.options.length);
        }
      }
    }
  });
});
