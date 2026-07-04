/**
 * Reusable property-test harness for question generators. Over many seeds and
 * every supported difficulty, asserts the invariants that make a generated
 * question SAFE: totality, determinism, correct stamping, non-empty text, and a
 * well-formed answer. Per-generator tests add engine-recompute checks on top.
 */
import { expect } from "vitest";
import { realize, type TaskGenerator } from "@/lib/chemistry/generators/types";

export interface HarnessOptions {
  seeds?: number;
  /** Optional sane bounds for numeric answers. */
  numeric?: { min?: number; max?: number };
}

export function checkGenerator(gen: TaskGenerator, opts: HarnessOptions = {}): void {
  const N = opts.seeds ?? 400;
  for (const difficulty of gen.difficulties) {
    for (let seed = 1; seed <= N; seed++) {
      // Totality — must never throw for any seed.
      const t = realize(gen, seed, difficulty);

      // Stamping.
      expect(t.generatorId).toBe(gen.id);
      expect(t.seed).toBe(seed);
      expect(t.topic).toBe(gen.topic);
      expect(t.difficulty).toBe(difficulty);

      // Content present.
      expect(t.prompt.length).toBeGreaterThan(0);
      expect(t.hints.length).toBeGreaterThan(0);
      expect(t.solution.length).toBeGreaterThan(0);

      // Determinism — same seed reproduces an identical task.
      expect(realize(gen, seed, difficulty)).toEqual(t);

      if (t.answer.kind === "numeric") {
        const { value, tolerance } = t.answer;
        expect(Number.isFinite(value)).toBe(true);
        expect(tolerance).toBeGreaterThan(0);
        // Tolerance is small relative to the value (never a free pass).
        expect(tolerance).toBeLessThan(Math.abs(value) * 0.5 + 1);
        if (opts.numeric?.min !== undefined) {
          expect(value).toBeGreaterThanOrEqual(opts.numeric.min);
        }
        if (opts.numeric?.max !== undefined) {
          expect(value).toBeLessThanOrEqual(opts.numeric.max);
        }
      } else {
        const { options, correctIndex } = t.answer;
        expect(options.length).toBeGreaterThanOrEqual(2);
        // Options are unique — no duplicate strings.
        expect(new Set(options).size).toBe(options.length);
        expect(correctIndex).toBeGreaterThanOrEqual(0);
        expect(correctIndex).toBeLessThan(options.length);
      }
    }
  }
}
