import { describe, it, expect } from "vitest";
import { seededRng } from "@/lib/chemistry/generators/rng";
import { sigTolerance, fmt, round } from "@/lib/chemistry/generators/format";
import {
  distractors,
  choiceFrom,
  errorModes,
} from "@/lib/chemistry/generators/distractors";

describe("seededRng", () => {
  it("is deterministic for a given seed", () => {
    const a = seededRng(12345);
    const b = seededRng(12345);
    const seqA = Array.from({ length: 8 }, () => a.next());
    const seqB = Array.from({ length: 8 }, () => b.next());
    expect(seqA).toEqual(seqB);
  });

  it("different seeds diverge", () => {
    const a = Array.from({ length: 8 }, (_, i) => seededRng(i + 1).next());
    expect(new Set(a).size).toBe(a.length);
  });

  it("int stays in range and covers both ends", () => {
    const r = seededRng(7);
    const seen = new Set<number>();
    for (let i = 0; i < 2000; i++) {
      const v = r.int(3, 6);
      expect(v).toBeGreaterThanOrEqual(3);
      expect(v).toBeLessThanOrEqual(6);
      seen.add(v);
    }
    expect(seen).toEqual(new Set([3, 4, 5, 6]));
  });

  it("shuffle is a permutation (no loss, no dupes)", () => {
    const xs = [1, 2, 3, 4, 5, 6, 7, 8];
    const s = seededRng(99).shuffle(xs);
    expect([...s].sort((p, q) => p - q)).toEqual(xs);
  });

  it("pick returns an element of the array", () => {
    const xs = ["a", "b", "c"] as const;
    const r = seededRng(2);
    for (let i = 0; i < 50; i++) expect(xs).toContain(r.pick(xs));
  });
});

describe("format helpers", () => {
  it("sigTolerance is positive and scales with magnitude", () => {
    expect(sigTolerance(180.16, 2)).toBeGreaterThan(0);
    expect(sigTolerance(1000, 2)).toBeGreaterThan(sigTolerance(10, 2));
  });
  it("fmt avoids negative zero", () => {
    expect(fmt(-0.0001, 2)).toBe("0.00");
    expect(round(2.345, 2)).toBe(2.35);
  });
});

describe("distractors", () => {
  it("returns unique, well-separated values that exclude the correct answer", () => {
    const rng = seededRng(42);
    const correct = 5.0;
    const cands = [5.0, 5.001, 3.2, 7.8, 1.1, 3.2];
    const d = distractors(correct, cands, 3, rng, 2);
    expect(d.length).toBeLessThanOrEqual(3);
    expect(new Set(d).size).toBe(d.length); // unique
    expect(d).not.toContain("5.00"); // never the correct value
  });

  it("choiceFrom includes the correct value exactly once and indexes it", () => {
    const rng = seededRng(3);
    const { options, correctIndex } = choiceFrom(7.42, ["1.10", "9.90", "3.30"], rng, 2);
    expect(options.filter((o) => o === "7.42")).toHaveLength(1);
    expect(options[correctIndex]).toBe("7.42");
  });

  it("error modes compute recognisable wrong answers", () => {
    expect(errorModes.signFlip(3)).toBe(-3);
    expect(errorModes.celsiusForKelvin(300)).toBeCloseTo(26.85, 2);
    expect(errorModes.droppedFactorOfTwo(10)).toBe(5);
  });
});
