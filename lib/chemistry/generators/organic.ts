/**
 * Organic generators — functional-group identification from the qualitative-test
 * matrix, and degree of unsaturation computed from a parsed molecular formula.
 * Both derive their answers from data/parser, not authored keys.
 */
import { parseFormula } from "@/lib/chemistry/balancer";
import { FUNCTIONAL_GROUPS, FG_TESTS } from "@/data/functionalGroups";
import { draw } from "./build";
import type { TaskGenerator } from "./types";

// Diagnostic tests: a (reagent, observation) that maps to exactly ONE group are
// the ones with an unambiguous answer. Derived from the data at module load.
interface Diagnostic {
  reagent: string;
  obs: string;
  groupId: string;
}
const DIAGNOSTICS: Diagnostic[] = [];
for (const test of FG_TESTS) {
  const positives = Object.entries(test.results).filter(([, v]) => v != null) as [string, string][];
  for (const [groupId, obs] of positives) {
    const sharing = positives.filter(([, o]) => o === obs);
    if (sharing.length === 1) DIAGNOSTICS.push({ reagent: test.reagent, obs, groupId });
  }
}

const GROUP_NAME: Record<string, string> = Object.fromEntries(
  FUNCTIONAL_GROUPS.map((g) => [g.id, g.name]),
);

export const functionalGroupIdGen: TaskGenerator = {
  id: "organic-fg-id",
  topic: "Organic",
  title: "Functional-group test",
  difficulties: ["Core"],
  build({ rng }) {
    const dx = draw(
      () => rng.pick(DIAGNOSTICS),
      (d) => d.groupId in GROUP_NAME,
    );
    const correctName = GROUP_NAME[dx.groupId];
    const distractors = rng
      .shuffle(FUNCTIONAL_GROUPS.filter((g) => g.id !== dx.groupId).map((g) => g.name))
      .slice(0, 3);
    const options = rng.shuffle([correctName, ...distractors]);
    return {
      title: "Functional-group test",
      prompt: `An unknown organic compound gives this result with ${dx.reagent}:\n  “${dx.obs}”.\nWhich functional group does it contain?`,
      given: [
        { label: "Reagent", value: dx.reagent },
        { label: "Observation", value: dx.obs },
      ],
      answer: { kind: "choice", options, correctIndex: options.indexOf(correctName) },
      hints: [
        "Match the reagent and the observation to the classic qualitative-test scheme.",
        `${dx.reagent} gives “${dx.obs}” with one particular functional group.`,
      ],
      solution: `${dx.reagent} → “${dx.obs}” is the diagnostic test for a ${correctName.toLowerCase()}.`,
      toolHref: "/reactions",
    };
  },
};

// Molecular formulas for degree-of-unsaturation practice.
const FORMULAS = [
  "C6H6", "C2H4", "C2H2", "C6H12", "C6H10", "C2H6O", "C3H6O", "C7H8",
  "C6H7N", "C2H4O2", "C6H12O6", "C10H8", "C8H8", "C6H6O", "C5H5N", "C6H5Cl",
];

const HALOGENS = ["F", "Cl", "Br", "I"];

/** Degree of unsaturation = (2C + 2 + N − H − X) / 2 from element counts. */
function degreeOfUnsaturation(counts: Record<string, number>): number {
  const C = counts.C ?? 0;
  const H = counts.H ?? 0;
  const N = counts.N ?? 0;
  const X = HALOGENS.reduce((sum, x) => sum + (counts[x] ?? 0), 0);
  return (2 * C + 2 + N - H - X) / 2;
}

export const degreeUnsaturationGen: TaskGenerator = {
  id: "organic-dou",
  topic: "Organic",
  title: "Degree of unsaturation",
  difficulties: ["Core", "Challenge"],
  build({ rng }) {
    const { formula, dou } = draw(
      () => {
        const formula = rng.pick(FORMULAS);
        const parsed = parseFormula(formula);
        if (parsed.error) return { formula, dou: NaN };
        return { formula, dou: degreeOfUnsaturation(parsed.counts) };
      },
      ({ dou }) => Number.isInteger(dou) && dou >= 0 && dou <= 8,
    );
    return {
      title: "Degree of unsaturation",
      prompt: `How many degrees of unsaturation (rings + π bonds) does ${formula} have?`,
      given: [{ label: "Formula", value: formula }],
      answer: { kind: "numeric", value: dou, unit: "", tolerance: 0 },
      hints: [
        "Degrees of unsaturation = (2C + 2 + N − H − X) / 2, where X is halogens.",
        "Oxygen and sulfur don't appear in the formula — they don't change the count.",
      ],
      solution: `DoU = (2C + 2 + N − H − X)/2 for ${formula} = ${dou}. Each ring or π bond counts as one.`,
      toolHref: "/molecules",
    };
  },
};
