/**
 * pH generators — strong-acid pH, weak-acid pH (multiple choice with distractors
 * from real error modes), and buffer pH (Henderson–Hasselbalch). Answers come
 * from the verified pH engine.
 */
import { pKaToKa, strongAcidPH, weakAcidPH, bufferPH } from "@/lib/chemistry/ph";
import { WEAK_ACIDS } from "@/data/weakAcidsBases";
import { draw } from "./build";
import { sigTolerance, fmt } from "./format";
import { distractors, choiceFrom } from "./distractors";
import type { TaskGenerator } from "./types";

const STRONG_ACIDS = [
  { name: "hydrochloric acid", formula: "HCl" },
  { name: "nitric acid", formula: "HNO₃" },
  { name: "perchloric acid", formula: "HClO₄" },
];

export const strongAcidPHGen: TaskGenerator = {
  id: "ph-strong-acid",
  topic: "pH",
  title: "Strong-acid pH",
  difficulties: ["Intro", "Core"],
  build({ rng, difficulty }) {
    const p = draw(
      () => ({
        acid: rng.pick(STRONG_ACIDS),
        c: difficulty === "Intro" ? rng.float(0.01, 0.2, 2) : rng.float(0.001, 0.5, 3),
      }),
      ({ c }) => {
        const ph = strongAcidPH(c);
        return ph > 0.3 && ph < 3.5;
      },
    );
    const ph = strongAcidPH(p.c);
    return {
      title: "Strong-acid pH",
      prompt: `What is the pH of a ${fmt(p.c, 3)} M solution of ${p.acid.name} (${p.acid.formula})?`,
      given: [{ label: "Concentration", value: `${fmt(p.c, 3)} M` }],
      answer: { kind: "numeric", value: ph, unit: "", tolerance: 0.05 },
      hints: [
        "A strong monoprotic acid dissociates fully, so [H⁺] ≈ the acid concentration.",
        "pH = −log₁₀[H⁺].",
      ],
      solution: `[H⁺] = ${fmt(p.c, 3)} M, so pH = −log₁₀(${fmt(p.c, 3)}) = ${fmt(ph, 2)}.`,
      toolHref: "/reactions",
    };
  },
};

export const weakAcidPHGen: TaskGenerator = {
  id: "ph-weak-acid",
  topic: "pH",
  title: "Weak-acid pH",
  difficulties: ["Core", "Challenge"],
  build({ rng }) {
    const p = draw(
      () => ({ acid: rng.pick(WEAK_ACIDS), c: rng.float(0.02, 0.5, 2) }),
      ({ acid, c }) => {
        const ph = weakAcidPH(c, pKaToKa(acid.pK));
        return ph > 1.5 && ph < 6.5;
      },
    );
    const ka = pKaToKa(p.acid.pK);
    const ph = weakAcidPH(p.c, ka);
    // Distractors from real mistakes: treated it as a strong acid, or read off pKa.
    const wrong = distractors(
      ph,
      [strongAcidPH(p.c), p.acid.pK, ph + 1, ph - 1, ph + 0.6],
      3,
      rng,
      2,
    );
    const { options, correctIndex } = choiceFrom(ph, wrong, rng, 2);
    return {
      title: "Weak-acid pH",
      prompt: `What is the pH of ${fmt(p.c, 2)} M ${p.acid.name} (pKa = ${fmt(p.acid.pK, 2)})?`,
      given: [
        { label: "Acid", value: `${p.acid.name} (${p.acid.formula})` },
        { label: "Concentration", value: `${fmt(p.c, 2)} M` },
        { label: "pKa", value: fmt(p.acid.pK, 2) },
      ],
      answer: { kind: "choice", options, correctIndex },
      hints: [
        "It's a weak acid — don't assume full dissociation; set up an ICE table.",
        "Ka = x²/(C − x) with x = [H⁺]; solve, then pH = −log₁₀(x).",
      ],
      solution: `Ka = 10^(−${fmt(p.acid.pK, 2)}); solving the ICE quadratic for [H⁺] gives pH = ${fmt(ph, 2)}.`,
      toolHref: "/reactions",
    };
  },
};

export const bufferPHGen: TaskGenerator = {
  id: "ph-buffer",
  topic: "pH",
  title: "Buffer pH",
  difficulties: ["Core", "Challenge"],
  build({ rng }) {
    const p = draw(
      () => ({
        acid: rng.pick(WEAK_ACIDS),
        nHA: rng.float(0.05, 0.5, 2),
        nA: rng.float(0.05, 0.5, 2),
      }),
      ({ nHA, nA }) => {
        const ratio = nA / nHA;
        return ratio >= 0.2 && ratio <= 5 && nHA > 0;
      },
    );
    const ph = bufferPH(p.acid.pK, p.nHA, p.nA);
    return {
      title: "Buffer pH",
      prompt: `A buffer contains ${fmt(p.nHA, 2)} mol of ${p.acid.name} (pKa ${fmt(p.acid.pK, 2)}) and ${fmt(p.nA, 2)} mol of its conjugate base. What is the pH?`,
      given: [
        { label: "Weak acid", value: `${fmt(p.nHA, 2)} mol (pKa ${fmt(p.acid.pK, 2)})` },
        { label: "Conjugate base", value: `${fmt(p.nA, 2)} mol` },
      ],
      answer: { kind: "numeric", value: ph, unit: "", tolerance: 0.05 },
      hints: [
        "Use the Henderson–Hasselbalch equation.",
        "pH = pKa + log₁₀([A⁻]/[HA]); the volumes cancel, so mole ratio is enough.",
      ],
      solution: `pH = pKa + log₁₀([A⁻]/[HA]) = ${fmt(p.acid.pK, 2)} + log₁₀(${fmt(p.nA, 2)}/${fmt(p.nHA, 2)}) = ${fmt(ph, 2)}.`,
      toolHref: "/reactions",
    };
  },
};
