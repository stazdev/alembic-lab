/**
 * Seeded pseudo-random number generator for procedural question generation.
 *
 * A question is fully described by (generatorId, seed): the same seed always
 * reproduces the same draw, which is what makes generated questions shareable,
 * assignable, and re-gradable without storing them. Pure and dependency-free.
 */

export interface Rng {
  /** Uniform in [0, 1). */
  next(): number;
  /** Uniform integer in [min, max], inclusive. */
  int(min: number, max: number): number;
  /** Uniform float in [min, max], rounded to `dp` decimals. */
  float(min: number, max: number, dp?: number): number;
  /** A random element of a non-empty array. */
  pick<T>(xs: readonly T[]): T;
  /** True with probability `p` (default 0.5). */
  bool(p?: number): boolean;
  /** A new array with the elements shuffled (Fisher–Yates). */
  shuffle<T>(xs: readonly T[]): T[];
}

/** mulberry32 — a small, fast, well-distributed 32-bit PRNG. */
export function seededRng(seed: number): Rng {
  let a = seed >>> 0;
  const next = (): number => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const int = (min: number, max: number): number =>
    min + Math.floor(next() * (max - min + 1));
  return {
    next,
    int,
    float: (min, max, dp = 2) => {
      const f = 10 ** dp;
      return Math.round((min + next() * (max - min)) * f) / f;
    },
    pick: (xs) => xs[int(0, xs.length - 1)],
    bool: (p = 0.5) => next() < p,
    shuffle: (xs) => {
      const out = [...xs];
      for (let i = out.length - 1; i > 0; i--) {
        const j = int(0, i);
        [out[i], out[j]] = [out[j], out[i]];
      }
      return out;
    },
  };
}

/**
 * A fresh seed for a brand-new question. Uses Math.random, so call it ONLY from
 * a client event handler (e.g. a "New question" click) — never during render,
 * or SSR and the client would disagree (hydration mismatch).
 */
export const freshSeed = (): number => (Math.random() * 2 ** 32) >>> 0;
