/**
 * Generator registry — the single place that lists every question generator.
 * The UI and the practice store address generators by id.
 */
import type { TaskTopic } from "@/data/tasks";
import type { TaskGenerator } from "./types";
import { molarMassGen, dilutionGen, molarityGen } from "./stoichiometry";
import { idealGasGen, combinedGasGen } from "./gases";
import { strongAcidPHGen, weakAcidPHGen, bufferPHGen } from "./solutions";
import { hessEnthalpyGen, gibbsGen, calorimetryGen } from "./energetics";
import { halfLifeGen, arrheniusGen } from "./kinetics";
import { solubilityGen, leChatelierGen } from "./equilibrium";
import { cellPotentialGen, nernstGen } from "./electrochem";

export const GENERATORS: TaskGenerator[] = [
  // Stoichiometry
  molarMassGen,
  dilutionGen,
  molarityGen,
  // Gas Laws
  idealGasGen,
  combinedGasGen,
  // pH
  strongAcidPHGen,
  weakAcidPHGen,
  bufferPHGen,
  // Thermodynamics
  hessEnthalpyGen,
  gibbsGen,
  calorimetryGen,
  // Kinetics
  halfLifeGen,
  arrheniusGen,
  // Equilibrium
  solubilityGen,
  leChatelierGen,
  // Electrochemistry
  cellPotentialGen,
  nernstGen,
];

const BY_ID = new Map(GENERATORS.map((g) => [g.id, g]));

export function generatorById(id: string): TaskGenerator | undefined {
  return BY_ID.get(id);
}

export function generatorsByTopic(topic: TaskTopic): TaskGenerator[] {
  return GENERATORS.filter((g) => g.topic === topic);
}

/** Distinct topics that have at least one generator, in registry order. */
export function generatorTopics(): TaskTopic[] {
  const seen = new Set<TaskTopic>();
  const out: TaskTopic[] = [];
  for (const g of GENERATORS) if (!seen.has(g.topic)) (seen.add(g.topic), out.push(g.topic));
  return out;
}

export const GENERATOR_IDS = GENERATORS.map((g) => g.id);
