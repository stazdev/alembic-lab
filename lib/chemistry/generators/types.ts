/**
 * Generator contract & the generated-task shape.
 *
 * `GeneratedTask` is a superset of the authored `Task` shape in data/tasks.ts,
 * so the existing TaskDetail/TaskCard grading (numeric tolerance / choice index)
 * renders and grades a generated task with no changes. A generator's static id
 * plus a seed replace the authored task's fixed id.
 */
import type { TaskTopic, TaskDifficulty, TaskAnswer } from "@/data/tasks";
import { seededRng, type Rng } from "./rng";

export type { TaskTopic, TaskDifficulty, TaskAnswer };

export interface GeneratedTask {
  generatorId: string;
  seed: number;
  topic: TaskTopic;
  difficulty: TaskDifficulty;
  title: string;
  prompt: string;
  given?: { label: string; value: string }[];
  answer: TaskAnswer;
  hints: string[];
  solution: string;
  toolHref?: string;
  moleculeKey?: string;
}

/** The part a generator authors; realize() stamps the rest. */
export type TaskBody = Omit<
  GeneratedTask,
  "generatorId" | "seed" | "topic" | "difficulty"
>;

/** Everything a generator needs for one draw. */
export interface GenContext {
  rng: Rng;
  seed: number;
  difficulty: TaskDifficulty;
}

export interface TaskGenerator {
  id: string;
  topic: TaskTopic;
  /** Human-facing family name, e.g. "Molar mass". */
  title: string;
  difficulties: TaskDifficulty[];
  /**
   * Pure: same (seed, difficulty) → identical body. Must always return a valid
   * task body (use `draw` for rejection sampling so this can't fail).
   */
  build(ctx: GenContext): TaskBody;
}

/** Resolve a shareable reference (generator + seed + difficulty) to a concrete task. */
export function realize(
  gen: TaskGenerator,
  seed: number,
  difficulty: TaskDifficulty,
): GeneratedTask {
  const body = gen.build({ rng: seededRng(seed), seed, difficulty });
  return {
    generatorId: gen.id,
    seed,
    topic: gen.topic,
    difficulty,
    ...body,
  };
}
