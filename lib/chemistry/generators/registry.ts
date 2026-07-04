/**
 * Generator registry — the single place that lists every question generator.
 * The UI and the practice store address generators by id.
 */
import type { TaskTopic } from "@/data/tasks";
import type { TaskGenerator } from "./types";
import { molarMassGen } from "./stoichiometry";

export const GENERATORS: TaskGenerator[] = [molarMassGen];

const BY_ID = new Map(GENERATORS.map((g) => [g.id, g]));

export function generatorById(id: string): TaskGenerator | undefined {
  return BY_ID.get(id);
}

export function generatorsByTopic(topic: TaskTopic): TaskGenerator[] {
  return GENERATORS.filter((g) => g.topic === topic);
}

export const GENERATOR_IDS = GENERATORS.map((g) => g.id);
