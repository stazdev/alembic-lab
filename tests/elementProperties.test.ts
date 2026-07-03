import { describe, it, expect } from "vitest";
import { ELEMENT_PROPERTIES } from "@/data/elementProperties";
import { ELEMENTS, ELEMENT_BY_SYMBOL } from "@/data/elements";

const P = ELEMENT_PROPERTIES;
const NUMERIC = [
  "electronegativity",
  "atomicRadius",
  "ionizationEnergy",
  "meltingPoint",
  "boilingPoint",
  "density",
] as const;

describe("element properties dataset", () => {
  it("has an entry for every element 1..118", () => {
    expect(Object.keys(P)).toHaveLength(118);
    for (let z = 1; z <= 118; z++) expect(P[z], `z=${z}`).toBeDefined();
  });

  it("uses valid types and standardState literals", () => {
    const states = new Set(["solid", "liquid", "gas", "unknown"]);
    for (let z = 1; z <= 118; z++) {
      const p = P[z];
      expect(states.has(p.standardState), `z=${z}`).toBe(true);
      for (const key of NUMERIC) {
        const v = p[key];
        expect(
          v === null || (typeof v === "number" && Number.isFinite(v)),
          `z=${z} ${key}`,
        ).toBe(true);
      }
    }
  });

  it("keeps numeric values in physically sane ranges", () => {
    for (let z = 1; z <= 118; z++) {
      const p = P[z];
      if (p.electronegativity != null) {
        expect(p.electronegativity, `EN z=${z}`).toBeGreaterThan(0);
        expect(p.electronegativity, `EN z=${z}`).toBeLessThanOrEqual(4.0);
      }
      if (p.atomicRadius != null) {
        expect(p.atomicRadius, `r z=${z}`).toBeGreaterThan(20);
        expect(p.atomicRadius, `r z=${z}`).toBeLessThan(300);
      }
      if (p.ionizationEnergy != null) {
        expect(p.ionizationEnergy, `IE z=${z}`).toBeGreaterThan(300);
        expect(p.ionizationEnergy, `IE z=${z}`).toBeLessThan(3000);
      }
      if (p.meltingPoint != null) {
        expect(p.meltingPoint, `mp z=${z}`).toBeGreaterThan(0);
        expect(p.meltingPoint, `mp z=${z}`).toBeLessThan(4200);
      }
      if (p.density != null) {
        expect(p.density, `d z=${z}`).toBeGreaterThan(0);
        expect(p.density, `d z=${z}`).toBeLessThan(45);
      }
    }
  });

  it("matches key anchor values", () => {
    expect(P[9].electronegativity).toBe(3.98); // F, most electronegative
    expect(P[55].electronegativity).toBe(0.79); // Cs, least
    expect(P[2].electronegativity).toBeNull(); // He
    expect(P[1].standardState).toBe("gas"); // H
    expect(P[80].standardState).toBe("liquid"); // Hg
    expect(P[80].density).toBe(13.53);
    expect(P[79].density).toBe(19.3); // Au
  });

  it("reflects classic periodic trends", () => {
    // Electronegativity rises across period 2 (Li -> F)
    expect(P[3].electronegativity!).toBeLessThan(P[9].electronegativity!);
    // Covalent radius grows down group 1 (Li < Na < K < Rb < Cs)
    const g1 = [3, 11, 19, 37, 55].map((z) => P[z].atomicRadius!);
    for (let i = 1; i < g1.length; i++) {
      expect(g1[i], `radius rank ${i}`).toBeGreaterThan(g1[i - 1]);
    }
    // First ionization energy: He (max) > Cs (min)
    expect(P[2].ionizationEnergy!).toBeGreaterThan(P[55].ionizationEnergy!);
  });

  it("merges the properties into ELEMENTS", () => {
    expect(ELEMENT_BY_SYMBOL["Au"].density).toBe(19.3);
    expect(ELEMENTS.every((e) => "standardState" in e)).toBe(true);
  });
});
