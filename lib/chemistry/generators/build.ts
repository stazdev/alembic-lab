/**
 * Rejection sampling: draw parameters until they pass a validity guard. The
 * guard is where pedagogy lives — it rejects degenerate, trivial, or ambiguous
 * draws so every generated question is well-posed. Bounded so it can't loop
 * forever; a property test asserts each generator's guard is satisfiable.
 */

export function draw<P>(
  sample: () => P,
  guard: (p: P) => boolean,
  maxTries = 50,
): P {
  for (let i = 0; i < maxTries; i++) {
    const p = sample();
    if (guard(p)) return p;
  }
  throw new Error(`generator: no valid draw within ${maxTries} tries`);
}
