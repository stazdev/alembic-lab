/**
 * Formatting & tolerance helpers shared by all generators. Keeping tolerance a
 * computed function (not a per-task magic number) is what lets grading stay
 * consistent across an unlimited supply of questions.
 */

/** Round to `dp` decimals. */
export function round(value: number, dp = 2): number {
  const f = 10 ** dp;
  return Math.round(value * f) / f;
}

/**
 * Grading tolerance for a numeric answer: the larger of 0.5% of the magnitude
 * or half a unit at the displayed precision. Generous enough for honest
 * rounding, tight enough that a wrong method fails.
 */
export function sigTolerance(value: number, dp = 2): number {
  return Math.max(Math.abs(value) * 0.005, 0.5 * 10 ** -dp);
}

/** Fixed-precision string, avoiding "-0.00". */
export function fmt(value: number, dp = 2): string {
  const r = round(value, dp);
  return (Object.is(r, -0) ? 0 : r).toFixed(dp);
}

/** Compact scientific notation for very small/large magnitudes, e.g. "1.3e-5". */
export function sci(value: number, sig = 2): string {
  if (value === 0) return "0";
  return value.toExponential(Math.max(0, sig - 1));
}
