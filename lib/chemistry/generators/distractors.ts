/**
 * Multiple-choice distractors built from real student error modes, so wrong
 * options are pedagogically meaningful rather than random noise. All computed —
 * never authored.
 */
import type { Rng } from "./rng";
import { fmt } from "./format";

/** Common ways a student arrives at a wrong number. */
export const errorModes = {
  signFlip: (x: number) => -x,
  /** Used a temperature in K where °C was needed (or vice-versa). */
  celsiusForKelvin: (x: number) => x - 273.15,
  kelvinForCelsius: (x: number) => x + 273.15,
  /** Forgot to square a term. */
  forgotToSquare: (x: number) => (x >= 0 ? Math.sqrt(x) : x),
  /** Off by a stoichiometric coefficient. */
  offByFactor: (x: number, c: number) => x * c,
  droppedFactorOfTwo: (x: number) => x / 2,
};

/**
 * Pick up to `n` unique, well-separated distractors around `correct`.
 * Rejects any candidate that is non-finite or closer to the correct value (or
 * to an already-chosen distractor) than the display resolution allows — so the
 * correct option is never ambiguous. May return fewer than `n` if candidates
 * run out; callers should supply enough.
 */
export function distractors(
  correct: number,
  candidates: number[],
  n: number,
  rng: Rng,
  dp = 2,
): string[] {
  const sep = 0.75 * 10 ** -dp;
  const chosen: number[] = [];
  for (const c of rng.shuffle(candidates)) {
    if (!Number.isFinite(c)) continue;
    if (Math.abs(c - correct) <= sep) continue;
    if (chosen.some((o) => Math.abs(o - c) <= sep)) continue;
    chosen.push(c);
    if (chosen.length === n) break;
  }
  return chosen.map((c) => fmt(c, dp));
}

/**
 * Assemble a shuffled option list from a correct value and its distractors,
 * returning the options and the index of the correct one. Guarantees the
 * correct string appears exactly once.
 */
export function choiceFrom(
  correct: number,
  wrong: string[],
  rng: Rng,
  dp = 2,
): { options: string[]; correctIndex: number } {
  const correctStr = fmt(correct, dp);
  const options = rng.shuffle([correctStr, ...wrong.filter((w) => w !== correctStr)]);
  return { options, correctIndex: options.indexOf(correctStr) };
}
