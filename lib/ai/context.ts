/**
 * Prompt grounding — the system instruction for the tutor and helpers that
 * describe what the student is looking at. Computed values are always declared
 * ground truth so the model explains real numbers instead of inventing them.
 */

export interface AiContext {
  /** Human-readable page/surface, e.g. "Sandbox bench". */
  page: string;
  /** What the student is doing there. */
  note?: string;
  /** Values the app already computed — passed to the model as authoritative. */
  facts?: { label: string; value: string }[];
}

const PAGES: Record<string, { page: string; note: string }> = {
  "/": { page: "Inventory Room", note: "browsing lab apparatus" },
  "/dashboard": { page: "Dashboard", note: "reviewing their progress" },
  "/sandbox": { page: "Sandbox bench", note: "mixing reagents in vessels" },
  "/reactions": { page: "Reaction tools", note: "using the chemistry calculators" },
  "/tasks": { page: "Guided Tasks", note: "working an auto-graded problem" },
  "/practice": { page: "Practice", note: "answering auto-generated questions" },
  "/periodic-table": { page: "Periodic Table", note: "exploring the elements" },
  "/molecules": { page: "Molecules explorer", note: "viewing 2D/3D structures" },
};

export function pageContext(pathname: string): AiContext {
  const hit = PAGES[pathname];
  return hit ? { page: hit.page, note: hit.note } : { page: "Alembic" };
}

/** Render a context into a prompt block the model can rely on. */
export function renderContext(ctx: AiContext): string {
  const lines = [
    `Context: the student is on the ${ctx.page} page${ctx.note ? ` (${ctx.note})` : ""}.`,
  ];
  if (ctx.facts && ctx.facts.length > 0) {
    lines.push(
      "Known values (already computed by Alembic's verified engines — treat these as ground truth; do not recompute or contradict them):",
    );
    for (const f of ctx.facts) lines.push(`- ${f.label}: ${f.value}`);
  }
  return lines.join("\n");
}

/** A problem shape shared by guided tasks and generated questions. */
export interface TaskLike {
  topic: string;
  prompt: string;
  given?: { label: string; value: string }[];
  answer:
    | { kind: "numeric"; value: number; unit?: string }
    | { kind: "choice"; options: string[]; correctIndex: number };
  solution: string;
}

const factsBlock = (facts: { label: string; value: string }[]): string =>
  facts.map((f) => `- ${f.label}: ${f.value}`).join("\n");

const answerText = (a: TaskLike["answer"]): string =>
  a.kind === "numeric" ? `${a.value}${a.unit ? ` ${a.unit}` : ""}` : a.options[a.correctIndex];

/** Explain a solution: the answer AND worked solution are provided as ground truth. */
export function explainSolutionPrompt(t: TaskLike): { system: string; prompt: string } {
  const facts = [
    { label: "Problem", value: t.prompt.replace(/\s+/g, " ").trim() },
    ...(t.given ?? []),
    { label: "Correct answer", value: answerText(t.answer) },
    { label: "Worked solution", value: t.solution },
  ];
  return {
    system: TUTOR_SYSTEM,
    prompt: `A student is working a ${t.topic} problem and wants to understand the solution.\n\nKnown values (computed by Alembic's verified engines — ground truth):\n${factsBlock(
      facts,
    )}\n\nExplain the reasoning behind this solution step by step so the student understands the method. Be concise; don't just restate the numbers.`,
  };
}

/** A single hint: the answer and solution are DELIBERATELY withheld. */
export function hintPrompt(t: TaskLike): { system: string; prompt: string } {
  const facts = [
    { label: "Problem", value: t.prompt.replace(/\s+/g, " ").trim() },
    ...(t.given ?? []),
  ];
  return {
    system: HINT_SYSTEM,
    prompt: `A student is solving a ${t.topic} problem and is stuck.\n\n${factsBlock(
      facts,
    )}\n\nGive exactly one short hint toward the method or next step. Do NOT reveal the final answer.`,
  };
}

export const HINT_SYSTEM = `You are the Alembic chemistry tutor giving a SINGLE hint to a student who is stuck on a problem.
- Offer one short, Socratic nudge toward the correct method or the next step.
- NEVER state or reveal the final numeric or multiple-choice answer, and never fully work the problem.
- Keep it to one or two sentences and encourage them to try.
- Refuse to help with anything unsafe, illegal, or harmful.`;

export const TUTOR_SYSTEM = `You are the Alembic chemistry tutor, helping secondary-school and undergraduate students with chemistry and biochemistry.

Guidelines:
- Be warm, patient, and concise. Prefer short paragraphs and plain language; explain jargon.
- When the app provides "Known values", they are computed by verified engines — use them as ground truth and never state a different number for the same quantity.
- Write formulae readably (e.g. H2SO4, or "sulfuric acid"); avoid heavy markdown or LaTeX.
- Teach the method, not just the answer. Encourage the student's reasoning.
- Refuse to help synthesise dangerous, illegal, or harmful substances, or anything unsafe to attempt outside a real supervised lab; redirect to the underlying concept instead.
- If you are unsure, say so briefly rather than guessing.`;
