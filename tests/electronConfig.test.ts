import { describe, it, expect } from "vitest";
import { electronConfiguration } from "@/lib/chemistry/electronConfig";
import { ELEMENTS } from "@/data/elements";

const shells = (z: number) => electronConfiguration(z).shells;

describe("electron configuration", () => {
  it("has shells summing to Z for every element", () => {
    for (const e of ELEMENTS) {
      const total = shells(e.z).reduce((a, b) => a + b, 0);
      expect(total, e.symbol).toBe(e.z);
    }
  });

  it("matches textbook shell structures, including the famous anomalies", () => {
    expect(shells(1)).toEqual([1]); // H
    expect(shells(2)).toEqual([2]); // He
    expect(shells(26)).toEqual([2, 8, 14, 2]); // Fe
    expect(shells(24)).toEqual([2, 8, 13, 1]); // Cr (anomaly)
    expect(shells(29)).toEqual([2, 8, 18, 1]); // Cu (anomaly)
    expect(shells(46)).toEqual([2, 8, 18, 18]); // Pd (anomaly)
    expect(shells(47)).toEqual([2, 8, 18, 18, 1]); // Ag (anomaly)
    expect(shells(79)).toEqual([2, 8, 18, 32, 18, 1]); // Au (anomaly)
    expect(shells(92)).toEqual([2, 8, 18, 32, 21, 9, 2]); // U (anomaly)
    expect(shells(118)).toEqual([2, 8, 18, 32, 32, 18, 8]); // Og
  });

  it("produces correct noble-gas shorthand notation", () => {
    expect(electronConfiguration(11).noble).toBe("[Ne] 3s¹"); // Na
    expect(electronConfiguration(17).noble).toBe("[Ne] 3s² 3p⁵"); // Cl
    expect(electronConfiguration(29).noble).toBe("[Ar] 3d¹⁰ 4s¹"); // Cu
    expect(electronConfiguration(26).noble).toBe("[Ar] 3d⁶ 4s²"); // Fe
  });

  it("reports valence electrons in the outermost shell", () => {
    expect(electronConfiguration(17).valence).toBe(7); // Cl
    expect(electronConfiguration(2).valence).toBe(2); // He
    expect(electronConfiguration(1).valence).toBe(1); // H
  });
});
