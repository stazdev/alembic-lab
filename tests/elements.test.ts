import { describe, it, expect } from "vitest";
import {
  ELEMENTS,
  ELEMENT_BY_Z,
  ELEMENT_BY_SYMBOL,
  CATEGORY_META,
  isFBlock,
} from "@/data/elements";

describe("element dataset integrity", () => {
  it("covers all 118 elements", () => {
    expect(ELEMENTS).toHaveLength(118);
  });

  it("has atomic numbers 1..118 with no gaps or duplicates", () => {
    const zs = ELEMENTS.map((e) => e.z).sort((a, b) => a - b);
    expect(zs).toEqual(Array.from({ length: 118 }, (_, i) => i + 1));
  });

  it("gives every element a finite molar mass from the shared table", () => {
    for (const e of ELEMENTS) {
      expect(Number.isFinite(e.mass), `${e.symbol} has no mass`).toBe(true);
    }
  });

  it("keeps groups in 1..18 and periods in 1..7", () => {
    for (const e of ELEMENTS) {
      expect(e.group, e.symbol).toBeGreaterThanOrEqual(1);
      expect(e.group, e.symbol).toBeLessThanOrEqual(18);
      expect(e.period, e.symbol).toBeGreaterThanOrEqual(1);
      expect(e.period, e.symbol).toBeLessThanOrEqual(7);
    }
  });

  it("has exactly 15 lanthanides (57–71) and 15 actinides (89–103) in the f-block", () => {
    const lanth = ELEMENTS.filter((e) => e.category === "lanthanide");
    const act = ELEMENTS.filter((e) => e.category === "actinide");
    expect(lanth.map((e) => e.z)).toEqual([57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71]);
    expect(act.map((e) => e.z)).toEqual([89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103]);
    for (const e of [...lanth, ...act]) {
      expect(e.block, e.symbol).toBe("f");
      expect(e.group, e.symbol).toBe(3);
      expect(isFBlock(e)).toBe(true);
    }
  });

  it("assigns every element a category that has presentation metadata", () => {
    for (const e of ELEMENTS) {
      expect(CATEGORY_META[e.category], `${e.symbol}:${e.category}`).toBeDefined();
    }
  });

  it("exposes working lookups by number and symbol", () => {
    expect(ELEMENT_BY_Z[26].symbol).toBe("Fe");
    expect(ELEMENT_BY_SYMBOL["Au"].name).toBe("Gold");
    expect(ELEMENT_BY_Z[118].name).toBe("Oganesson");
  });
});
