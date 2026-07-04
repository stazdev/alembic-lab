# Non-Hardcoded Tasks — A Procedural Question-Generation Engine

> Replace the fixed bank of 39 authored tasks in `data/tasks.ts` with an engine that **generates
> unlimited, varied, always-correctly-graded questions** — parameters sampled at runtime, answers
> computed by the same verified chemistry engines the student's tools use.
>
> Design constraints inherited from the project: **no backend** (all generation runs in the browser),
> **deterministic and reproducible** (a question is fully described by a seed, so it can be shared,
> assigned, and re-graded identically), and **never wrong** (the answer and the tolerance are computed,
> never authored, and are property-tested).

---

## Table of Contents

1. [The core idea](#1-the-core-idea)
2. [Why not just author more questions / use an LLM](#2-why-not-just-author-more-questions--use-an-llm)
3. [Architecture & layering](#3-architecture--layering)
4. [The seeded PRNG (reproducibility)](#4-the-seeded-prng-reproducibility)
5. [Types & the generator contract](#5-types--the-generator-contract)
6. [The generation pipeline (sample → guard → compute → render)](#6-the-generation-pipeline)
7. [Validity guards & rejection sampling](#7-validity-guards--rejection-sampling)
8. [Answers, tolerances & distractors — all computed](#8-answers-tolerances--distractors--all-computed)
9. [Difficulty scaling](#9-difficulty-scaling)
10. [Templated prompts, hints & worked solutions](#10-templated-prompts-hints--worked-solutions)
11. [Worked example generators (real APIs)](#11-worked-example-generators)
12. [Progress & mastery rework](#12-progress--mastery-rework)
13. [UI integration](#13-ui-integration)
14. [Testing strategy (the correctness guarantee)](#14-testing-strategy)
15. [Migration from the 39 fixed tasks](#15-migration-from-the-39-fixed-tasks)
16. [Generator coverage map](#16-generator-coverage-map)
17. [Optional: ML-assisted difficulty & phrasing](#17-optional-ml-assisted-difficulty--phrasing)
18. [File manifest & phased roadmap](#18-file-manifest--phased-roadmap)
19. [Risks & mitigations](#19-risks--mitigations)

---

## 1. The core idea

A question is not a string — it is a **function of a seed**:

```
question = generator.generate(seededRng(seed))
```

Each `generate` call:
1. **Samples parameters** from ranges tuned to a difficulty (e.g. pick a formula, a concentration, a volume).
2. **Guards validity** — redraw if the draw is degenerate, ambiguous, or pedagogically ugly.
3. **Computes the answer** by calling the existing verified engine (`molarMass`, `balanceEquation`, `reactionThermo`, `solveIdeal`, `weakAcidPH`, …) — the number is never typed by a human.
4. **Renders** a prompt, staged hints, a worked solution, and (for multiple-choice) computed distractors, by interpolating the sampled values and the engine's intermediate results into templates.

Because the same seed reproduces the same draw, a generated question is **shareable and assignable**
(`/tasks?g=stoich-molar-mass&s=8817342`) and **re-gradable** without storing the question anywhere.
Because the answer comes from the tool engine, grading **can never drift** — the exact property the
current authored bank already relies on ([`data/tasks.ts` header](data/tasks.ts)), now generalized.

---

## 2. Why not just author more questions / use an LLM

- **Authoring more** — linear effort, still finite, students memorize answers, no per-attempt variation.
  It does not solve "the questions are fixed."
- **An LLM writing questions** — would need a model (violates no-backend unless in-browser, ~GB
  download) and, fatally, **an LLM can produce a wrong or unsolvable question and a mis-keyed answer**.
  That breaks the project's #1 promise (always-correct chemistry). An LLM may *phrase* a question
  (§17), but it must never *own the numbers*.
- **Procedural generation** — unlimited variation, zero marginal authoring cost per attempt, and the
  answer is guaranteed correct because it is computed by the same audited engine the app grades with
  and is property-tested across thousands of seeds. This is the standard approach in mature learning
  platforms (Khan Academy's `perseus`, ASSISTments, STACK for maths).

---

## 3. Architecture & layering

Mirrors the existing strict layering (pure domain, no React, unit-tested):

```
lib/chemistry/generators/
  rng.ts              # seeded PRNG + sampling helpers (pure, no deps)
  types.ts            # TaskGenerator, GeneratedTask, GenContext
  registry.ts         # id → generator; lookup, list-by-topic/difficulty
  format.ts           # number/quantity formatting + tolerance helpers
  distractors.ts      # error-mode distractor builders (sign flip, °C↔K, …)
  balancing.ts        # generators for the Balancing topic
  stoichiometry.ts    # molar mass, moles, dilution, limiting reagent
  solutions.ts        # pH, buffers, titration
  gases.ts            # ideal & combined gas law
  energetics.ts       # Hess ΔH, ΔG, calorimetry
  kinetics.ts         # half-life, Arrhenius, integrated laws
  … one file per topic
lib/stores/
  practiceStore.ts    # per-generator mastery (replaces the 39-item completed[])
components/features/tasks/
  PracticeView.tsx    # "generate / try another / share" UI over a generator
tests/generators/*.test.ts   # property tests: every seed grades correctly
```

Rules (unchanged from the codebase): `generators/` imports **only** other pure `lib/chemistry/*`
modules and data — never React, Three, or stores. The UI consumes generated tasks through props.

---

## 4. The seeded PRNG (reproducibility)

A tiny, dependency-free deterministic RNG (mulberry32). `Math.random()` is used **only** to mint a
fresh seed when the student asks for a new question (a client event — never during SSR, so no
hydration mismatch, consistent with the lesson already applied to the tasks page).

```ts
// lib/chemistry/generators/rng.ts
export interface Rng {
  next(): number;              // [0,1)
  int(min: number, max: number): number;      // inclusive
  float(min: number, max: number, dp?: number): number;
  pick<T>(xs: readonly T[]): T;
  bool(p?: number): boolean;
  shuffle<T>(xs: readonly T[]): T[];
}

export function seededRng(seed: number): Rng {
  let a = seed >>> 0;
  const next = () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const int = (min: number, max: number) => min + Math.floor(next() * (max - min + 1));
  return {
    next, int,
    float: (min, max, dp = 2) => {
      const v = min + next() * (max - min);
      const f = 10 ** dp; return Math.round(v * f) / f;
    },
    pick: (xs) => xs[int(0, xs.length - 1)],
    bool: (p = 0.5) => next() < p,
    shuffle: (xs) => { const a2 = [...xs];
      for (let i = a2.length - 1; i > 0; i--) { const j = int(0, i); [a2[i], a2[j]] = [a2[j], a2[i]]; }
      return a2; },
  };
}

/** A fresh seed for a brand-new question — client-only (event handler), never in render. */
export const freshSeed = () => (Math.random() * 2 ** 32) >>> 0;
```

---

## 5. Types & the generator contract

`GeneratedTask` is a superset of the existing [`Task`](data/tasks.ts) shape, so `TaskDetail` /
`TaskCard` render it almost unchanged. The static `id` becomes `{ generatorId, seed }`.

```ts
// lib/chemistry/generators/types.ts
import type { TaskTopic, TaskDifficulty, TaskAnswer } from "@/data/tasks";
import type { Rng } from "./rng";

export interface GeneratedTask {
  generatorId: string;
  seed: number;
  topic: TaskTopic;
  difficulty: TaskDifficulty;
  title: string;
  prompt: string;
  given?: { label: string; value: string }[];
  answer: TaskAnswer;            // reuse the existing numeric | choice union
  hints: string[];
  solution: string;
  toolHref?: string;
  moleculeKey?: string;
}

export interface TaskGenerator {
  id: string;
  topic: TaskTopic;
  title: string;                 // family name, e.g. "Molar mass"
  difficulties: TaskDifficulty[];
  /** Pure: same (seed, difficulty) → identical task. Must always return a valid task. */
  generate(rng: Rng, difficulty: TaskDifficulty): GeneratedTask;
}

/** Convenience: resolve a shareable reference to a concrete task. */
export function realize(gen: TaskGenerator, seed: number, difficulty: TaskDifficulty): GeneratedTask {
  return gen.generate(seededRng(seed), difficulty);
}
```

Reusing `TaskAnswer` means the existing grading in [`TaskDetail.check()`](components/features/tasks/TaskDetail.tsx)
(numeric tolerance / choice index) works with **zero changes**.

---

## 6. The generation pipeline

Every generator follows the same four-stage shape, wrapped by a shared `build()` helper that enforces
rejection sampling and computes the tolerance:

```
sample(rng, difficulty) → params
      │  (retry up to N times if !valid)
      ▼
guard(params) : boolean          // §7
      ▼
compute(params) → { answer, steps }   // calls the verified engine — §8
      ▼
render(params, steps) → { prompt, given, hints, solution, distractors? }  // §10
```

```ts
// lib/chemistry/generators/build.ts
export function build<P>(cfg: {
  rng: Rng; difficulty: TaskDifficulty; maxTries?: number;
  sample: () => P;
  guard: (p: P) => boolean;
  make: (p: P) => Omit<GeneratedTask, "generatorId" | "seed" | "topic" | "difficulty">;
}): Omit<GeneratedTask, "generatorId" | "seed" | "topic" | "difficulty"> {
  const tries = cfg.maxTries ?? 40;
  for (let i = 0; i < tries; i++) {
    const p = cfg.sample();
    if (cfg.guard(p)) return cfg.make(p);
  }
  throw new Error("generator failed to find a valid draw"); // caught by a property test
}
```

---

## 7. Validity guards & rejection sampling

The guard is where pedagogy lives. Draw, check, redraw. Reject anything that would make a bad question:

- **Degenerate math** — divide-by-zero, `NaN`/`Infinity` answers, non-integer balancing coefficients
  where integers are expected, negative concentrations/volumes.
- **Trivial answers** — coefficient of 1, a dilution factor of 1, ΔH ≈ 0, pH landing exactly on 7.
- **Ambiguous rounding** — the correct numeric answer must be separated from every distractor by more
  than the tolerance, and must round cleanly at the displayed precision.
- **Out of teaching range** — molar masses in a sane band, pH ∈ (0,14), temperatures physical, gas
  volumes realistic. Ranges are difficulty-scaled (§9).
- **Reagent realism** — sample formulas/species from the app's existing curated data
  (`atomicMasses`, `THERMO_BY_ID`, `weakAcidsBases`, `HALF_BY_ID`) so every species is real and has
  the constants the engine needs.

Guards make generation **total**: `build()` is guaranteed to return a good task, and a property test
asserts the guard is satisfiable within `maxTries` for every generator × difficulty.

---

## 8. Answers, tolerances & distractors — all computed

**Answer** — always the engine's output, never a literal:

```ts
const { molarMass: mm } = molarMass(formula).value; // stoichiometry engine (Result<MolarMassResult>)
answer = { kind: "numeric", value: mm, unit: "g/mol", tolerance: sigTolerance(mm, 3) };
```

**Tolerance** — a helper, not a magic number. Relative to magnitude and displayed precision:

```ts
// lib/chemistry/generators/format.ts
export const sigTolerance = (value: number, dp = 2) =>
  Math.max(Math.abs(value) * 0.005, 0.5 * 10 ** -dp); // 0.5% or half a display unit, whichever larger
```

**Distractors (MCQ)** — computed from *known student error modes*, so wrong options are pedagogically
meaningful, not random noise:

```ts
// lib/chemistry/generators/distractors.ts
export const errorModes = {
  signFlip: (x: number) => -x,
  celsiusForKelvin: (x: number) => x - 273.15,       // used K where °C was needed
  forgotToSquare: (x: number) => Math.sqrt(x),
  offByCoefficient: (x: number, c: number) => x * c,
  droppedFactorOfTwo: (x: number) => x / 2,
};

/** Build N unique, well-separated distractors around a correct value. */
export function distractors(correct: number, candidates: number[], n: number, rng: Rng, dp = 2): string[] {
  const sep = 0.75 * 10 ** -dp;
  const uniq = candidates
    .filter((c) => Number.isFinite(c) && Math.abs(c - correct) > sep)
    .filter((c, i, a) => a.findIndex((o) => Math.abs(o - c) <= sep) === i);
  return rng.shuffle(uniq).slice(0, n).map((c) => c.toFixed(dp));
}
```

The correct option is inserted at a `rng`-chosen index so its position varies; `correctIndex` is set
accordingly. A guard asserts exactly one option matches the correct value within `sep`.

---

## 9. Difficulty scaling

Difficulty controls (a) parameter ranges, (b) how many sub-skills combine, and (c) whether the answer
is a single step or a chain:

| Difficulty | Levers |
|---|---|
| **Intro** | Small integers, single formula/step, "nice" numbers, wide tolerance, often multiple-choice with obvious distractors. |
| **Core** | Realistic decimals, two-step chains (e.g. mass → moles → molarity), tighter tolerance, numeric entry. |
| **Challenge** | Multi-step (limiting reagent → yield; titration to equivalence), harder species (polyprotic, redox), distractors drawn from subtle error modes, tightest tolerance. |

Each generator declares which difficulties it supports and reads difficulty inside `sample()`:

```ts
const range = { Intro: [10, 100], Core: [50, 300], Challenge: [100, 600] }[difficulty];
```

---

## 10. Templated prompts, hints & worked solutions

The generator interpolates sampled values **and the engine's intermediate results** into templates.
Several phrasings per generator give surface variety without an LLM. Hints are staged; the solution
narrates the exact computed steps, so it always matches the graded number.

```ts
const phrasings = [
  (f: string) => `Calculate the molar mass of ${f}.`,
  (f: string) => `What is the molar mass of ${f} (in g/mol)?`,
  (f: string) => `Find M for ${f}.`,
];
const prompt = rng.pick(phrasings)(pretty(formula));

// Worked solution built from molarMass()'s per-element parts (already returned by the engine).
// MolarMassPart = { element, count, atomicMass, subtotal }.
const solution = parts
  .map((p) => `${p.count} × ${p.element} (${p.atomicMass.toFixed(3)}) = ${p.subtotal.toFixed(3)}`)
  .join("  +  ") + `  =  ${mm.toFixed(2)} g/mol`;
```

Because the solution is generated from the same `parts` the answer used, it can never contradict the
key. Chemical formatting reuses the existing `<FormulaText>` / `<ChemEquation>` components in the UI.

---

## 11. Worked example generators

Concrete, using the **real** engine signatures verified in the codebase.

### 11a. Molar mass (Stoichiometry · Intro/Core)

```ts
import { molarMass } from "@/lib/chemistry/stoichiometry";
import { build } from "./build";
import { sigTolerance } from "./format";

const POOL = ["H2O","CO2","NaCl","H2SO4","CaCO3","C6H12O6","NH3","KMnO4","Fe2O3","Ca(OH)2","MgCl2","C2H5OH"];

export const molarMassGen: TaskGenerator = {
  id: "stoich-molar-mass", topic: "Stoichiometry", title: "Molar mass",
  difficulties: ["Intro", "Core"],
  generate(rng, difficulty) {
    const body = build({
      rng, difficulty,
      sample: () => rng.pick(difficulty === "Intro" ? POOL.slice(0, 6) : POOL),
      guard: (f) => { const r = molarMass(f); return r.ok && r.value.molarMass > 0; },
      make: (formula) => {
        const { molarMass: mm, parts } = molarMass(formula).value; // MolarMassResult
        return {
          title: "Molar mass",
          prompt: `Calculate the molar mass of ${formula} (g/mol).`,
          answer: { kind: "numeric", value: mm, unit: "g/mol", tolerance: sigTolerance(mm, 2) },
          hints: [
            "Add the atomic mass of every atom in the formula.",
            `Count each element: ${parts.map((p) => `${p.count}×${p.element}`).join(", ")}.`,
          ],
          solution: parts.map((p) => `${p.count}×${p.element}(${p.atomicMass.toFixed(3)})`).join(" + ")
            + ` = ${mm.toFixed(2)} g/mol`,
          toolHref: "/reactions",
        };
      },
    });
    return { generatorId: this.id, seed: 0, topic: this.topic, difficulty, ...body };
  },
};
```

### 11b. Ideal gas law, solve for the missing variable (Gas Laws · Core)

```ts
import { solveIdeal, R_L_ATM } from "@/lib/chemistry/gasLaws";

export const idealGasGen: TaskGenerator = {
  id: "gas-ideal-solve", topic: "Gas Laws", title: "Ideal gas law",
  difficulties: ["Core", "Challenge"],
  generate(rng, difficulty) {
    const body = build({
      rng, difficulty,
      sample: () => {
        const n = rng.float(0.2, 3, 2), T = rng.int(250, 500);
        const V = rng.float(1, 40, 1);
        const P = (n * R_L_ATM * T) / V;                 // consistent state
        const solveFor = rng.pick(["P", "V", "n", "T"] as const);
        return { n, T, V, P, solveFor };
      },
      guard: (p) => p.P > 0.1 && p.P < 50,               // realistic pressures
      make: ({ n, T, V, P, solveFor }) => {
        const known = { P, V, n, T }; delete (known as Record<string, number>)[solveFor];
        const res = solveIdeal(known);                    // engine solves & is the key
        const val = res.ok ? res.value : NaN;
        const unit = { P: "atm", V: "L", n: "mol", T: "K" }[solveFor];
        return {
          title: "Ideal gas law",
          prompt: `A gas sample has ${Object.entries(known)
            .map(([k, v]) => `${k} = ${(v as number).toFixed(2)}`).join(", ")}. Find ${solveFor} (${unit}).`,
          answer: { kind: "numeric", value: val, unit, tolerance: sigTolerance(val, 2) },
          hints: ["Rearrange PV = nRT for the unknown.", `Use R = ${R_L_ATM} L·atm·mol⁻¹·K⁻¹; T is already in K.`],
          solution: `PV = nRT  ⇒  ${solveFor} = ${val.toFixed(2)} ${unit}`,
          toolHref: "/reactions",
        };
      },
    });
    return { generatorId: this.id, seed: 0, topic: this.topic, difficulty, ...body };
  },
};
```

### 11c. Weak-acid pH, multiple-choice with computed distractors (pH · Core)

```ts
import { pKaToKa, weakAcidPH, strongAcidPH } from "@/lib/chemistry/ph";
import { WEAK_ACIDS } from "@/data/weakAcidsBases";
import { distractors } from "./distractors";

export const weakAcidPHGen: TaskGenerator = {
  id: "ph-weak-acid", topic: "pH", title: "Weak-acid pH",
  difficulties: ["Core", "Challenge"],
  generate(rng, difficulty) {
    const body = build({
      rng, difficulty,
      sample: () => ({ acid: rng.pick(WEAK_ACIDS), c: rng.float(0.01, 0.5, 2) }),
      guard: ({ c }) => c > 0,
      make: ({ acid, c }) => {                            // AcidBasePreset = { name, formula, pK }
        const ka = pKaToKa(acid.pK);
        const ph = weakAcidPH(c, ka);                     // engine = key
        const options = [
          ph.toFixed(2),
          strongAcidPH(c).toFixed(2),                     // error: treated it as strong
          acid.pK.toFixed(2),                             // error: reported pKa
          ...distractors(ph, [ph + 1, ph - 1], 1, rng, 2),
        ];
        const shuffled = rng.shuffle(options);
        return {
          title: "Weak-acid pH",
          prompt: `What is the pH of ${c.toFixed(2)} M ${acid.name} (pKa ${acid.pK})?`,
          answer: { kind: "choice", options: shuffled, correctIndex: shuffled.indexOf(ph.toFixed(2)) },
          hints: ["It's a weak acid — set up the ICE table, don't treat it as fully dissociated.",
                  "Ka = x²/(C−x); solve for x = [H⁺], then pH = −log[H⁺]."],
          solution: `Ka = 10^−${acid.pK}; solving the ICE quadratic gives [H⁺] and pH = ${ph.toFixed(2)}.`,
          toolHref: "/reactions",
        };
      },
    });
    return { generatorId: this.id, seed: 0, topic: this.topic, difficulty, ...body };
  },
};
```

*(Balancing, dilution, limiting-reagent/yield, Hess-law ΔH, half-life/Arrhenius, Nernst, and
Ksp-solubility generators follow the identical shape against `balanceEquation`, `solveDilution`,
`solveLimiting`, `reactionThermo`, `halfLife`/`activationEnergy`, `standardCellPotential`/`nernst`,
and `molarSolubility` respectively.)*

---

## 12. Progress & mastery rework

"Completed 39/39" is meaningless when questions are infinite. Replace the `completed: string[]` store
with **per-generator mastery**, which also sets up the adaptive-learning idea from the improvement plan
([FSRS/BKT](Lab-improvement.md)).

```ts
// lib/stores/practiceStore.ts  (persisted as "alembic-practice")
interface GenStat { attempts: number; correct: number; streak: number; lastSeed: number; mastered: boolean; }
interface PracticeState {
  stats: Record<string, GenStat>;             // key = generatorId
  record: (generatorId: string, correct: boolean, seed: number) => void;
  reset: () => void;
}
```

- **Mastery rule** (simple, transparent first — BKT later): `mastered = streak ≥ 3` at Core+.
- **Dashboard** shows "topics mastered / total generators" and a per-topic bar — derived from `stats`,
  read behind the `useMounted()` guard we already established.
- **Backward-compat:** keep the old `alembic-tasks` key readable for one release; migrate on load.

---

## 13. UI integration

A new `PracticeView` (or an evolution of `TasksView`) drives a generator instead of a static list:

- **Pick a topic/generator + difficulty** → renders one `GeneratedTask` via `TaskDetail` (unchanged).
- **"New question"** button → `freshSeed()` → regenerate (client event, so no SSR/hydration issue).
- **"Try another like this"** → same generator, new seed; **"Harder/Easier"** → bump difficulty.
- **Shareable / assignable:** the URL carries `?g=<generatorId>&s=<seed>&d=<difficulty>`; opening it
  reproduces the exact question — the mechanism instructors use to set homework. Generation reads the
  seed from the URL on mount; absent → fresh seed after mount.
- **"Report this question"** → logs `{generatorId, seed}` locally for SME review (reproducible from the
  seed alone — no need to store the rendered question).

The existing 39 authored tasks can remain as a curated "Featured" tab alongside "Practice" (§15).

---

## 14. Testing strategy (the correctness guarantee)

This is what makes generated questions **safe**. Property tests in `tests/generators/`:

For every generator × supported difficulty, over N (e.g. 2000) seeds:
1. **Totality** — `generate()` never throws; the guard is satisfiable within `maxTries`.
2. **Determinism** — same seed → deep-equal task (guards reproducibility/sharing).
3. **Answer recomputes** — re-running the cited engine on the rendered `given` reproduces the keyed
   `answer.value` within tolerance (catches any template/ґparam desync).
4. **MCQ well-formed** — exactly one option equals the correct value within `sep`; `correctIndex`
   points to it; options are unique.
5. **Sane tolerance** — `tolerance > 0` and small relative to the value; no distractor falls inside it.
6. **In range** — pH ∈ (0,14), masses/temps/volumes physical, no `NaN`/`Infinity`.
7. **Solution references the answer** — the solution string contains the computed result (cheap
   guard against copy-paste template drift).

A handful of **fixed-seed snapshots** per generator are committed for SME eyeballing (the human-review
analogue of the current authored bank).

---

## 15. Migration from the 39 fixed tasks

No big-bang rewrite:

1. **Ship generators alongside** the existing bank; add a "Practice" mode. The 39 stay as "Featured".
2. Each existing authored task is, in effect, one generator at one seed — where a generator covers a
   featured task, the featured version becomes `realize(gen, fixedSeed, difficulty)`, proving parity.
3. Once every topic has a generator with passing property tests, `data/tasks.ts` shrinks to a small
   **curated highlights** list (nice hand-picked scenarios) and the infinite supply comes from
   generators.
4. Progress migrates from `alembic-tasks.completed[]` to `alembic-practice.stats` on first load.

---

## 16. Generator coverage map

| Topic | Generators (engine used) |
|---|---|
| **Balancing** | combustion / synthesis / precipitation coefficient (`balanceEquation`); redox half-reaction (`balanceRedox`) |
| **Stoichiometry** | molar mass (`molarMass`); mass↔moles↔molarity; dilution C₁V₁=C₂V₂ (`solveDilution`); limiting reagent & % yield (`solveLimiting`) |
| **Gas Laws** | ideal solve-for-x (`solveIdeal`); combined-law before/after (`solveCombined`) |
| **pH / Titration** | strong/weak acid & base pH (`strong/weakAcidPH`); buffer H–H (`bufferPH`); equivalence pH (`titrateAcidWithBase`) |
| **Thermodynamics** | Hess-law ΔH°rxn (`reactionThermo`); ΔG = ΔH − TΔS & spontaneity (`gibbs`); calorimetry q=mcΔT (`heat`) |
| **Kinetics** | half-life by order (`halfLife`); Arrhenius Ea from two (k,T) (`activationEnergy`); integrated-law concentration (`concentrationAtTime`) |
| **Equilibrium** | Ksp ↔ molar solubility (`molarSolubility`); Le Chatelier shift (`leChatelier`, choice) |
| **Electrochemistry** | standard cell potential (`standardCellPotential`); Nernst at non-standard Q (`nernst`) |
| **Enzyme Kinetics** | Michaelis–Menten v (`michaelisMenten`); fraction of Vmax (`rateFraction`) |
| **Organic / Biochem** *(after the plan's structure work)* | functional-group identification from a generated structure; degree-of-unsaturation; when generators can consume SMILES + the property engine |

Every one reuses an **already-verified** engine — so adding a generator adds variation, not new
math that could be wrong.

---

## 17. Optional: ML-assisted difficulty & phrasing

Strictly optional, and never allowed to own the answer:

- **Adaptive difficulty** — a lightweight **BKT** mastery estimate (≈30 lines, per the improvement
  plan) picks the next generator/difficulty to target a ~75–85% success rate. Pure JS, no backend.
- **Phrasing variety** — the multiple hand-written templates (§10) already give surface variation with
  zero model. If richer natural-language phrasing is ever wanted, an **in-browser** small LM (per the
  plan's ONNX/transformers.js path) could *rewrite the prompt text only* — the parameters, answer, and
  solution stay engine-owned and are re-validated, so a bad rewrite can degrade wording but **never**
  the correctness of the graded question.

---

## 18. File manifest & phased roadmap

**New files**

```
lib/chemistry/generators/{rng,types,build,format,distractors,registry}.ts
lib/chemistry/generators/{balancing,stoichiometry,solutions,gases,energetics,kinetics,equilibrium,electrochemistry}.ts
lib/stores/practiceStore.ts
components/features/tasks/PracticeView.tsx   (+ small edits to TaskDetail for generatorId/seed)
tests/generators/*.test.ts
```

**Phases**

| Phase | Scope | Outcome | Status |
|---|---|---|---|
| **G0 — Kernel** | `rng`, `types`, `build`, `format`, `distractors`, `registry` + property-test harness | The generation machinery, proven on one generator | ✅ **shipped** |
| **G1 — Quant topics** | Stoichiometry, Gas Laws, pH, Thermo, Kinetics, Equilibrium, Electrochem generators (2–4 each) + property tests | Infinite, correct questions for the whole quantitative curriculum | ✅ **shipped** — 17 generators, all engine-graded, property-tested |
| **G2 — UI & mastery** | `PracticeView`, seed-in-URL sharing, `practiceStore`, Dashboard mastery, migration from `alembic-tasks` | Students practice unlimited varied questions; instructors assign by URL | ✅ **shipped** — `/practice` route, per-generator mastery, ?g&s&d sharing, walkthrough |
| **G3 — Balancing & organic** | Balancing/redox generators; organic/functional-group generators after the structure work in the improvement plan | Full topic coverage | |
| **G4 — Adaptive (optional)** | BKT difficulty selection; optional in-browser phrasing | Personalized practice | |

**G1 shipped (17 generators):** molar mass · dilution · molarity · ideal gas · combined gas · strong-acid
pH · weak-acid pH (MCQ) · buffer pH · Hess ΔH · Gibbs ΔG · calorimetry · half-life · Arrhenius Ea ·
molar solubility (MCQ) · Le Chatelier (MCQ) · standard cell potential · Nernst. Every answer is computed
by the corresponding verified engine; 145 tests pass (property sweep across ~300 seeds × each generator).
The engine files landed as `gases.ts` / `energetics.ts` / `electrochem.ts` (not the tentative names above).

---

## 19. Risks & mitigations

| Risk | Mitigation |
|---|---|
| A generated question is unsolvable, ambiguous, or mis-keyed | Answer & distractors computed by the audited engine; §14 property tests over thousands of seeds assert recompute-parity, single-correct-option, and separation > tolerance before anything ships |
| Rejection sampling loops forever | Bounded `maxTries`; a property test proves the guard is satisfiable for every generator × difficulty |
| Non-reproducible questions break sharing/grading | Seeded PRNG; determinism test; `Math.random()` used only to mint new seeds on a client event, never in render (no SSR/hydration drift) |
| Ugly numbers / trivial answers hurt UX | Guards reject trivial and non-clean draws; difficulty-scaled ranges; SME-reviewed fixed-seed snapshots |
| Losing the pedagogical quality of hand-authored tasks | Keep the 39 as a curated "Featured" set; generators supplement rather than replace hand-crafted scenarios |
| Progress reset annoyance on migration | Read the legacy `alembic-tasks` key for one release and migrate mastery on load |

---

*Companion to `Lab-improvement.md`. This engine makes the **tasks** non-hardcoded; Improvement 1 in
that plan makes the **sandbox reactions** non-hardcoded. Both share the same principle: author the
templates and the datasets, never the answers — compute those, and property-test them.*
