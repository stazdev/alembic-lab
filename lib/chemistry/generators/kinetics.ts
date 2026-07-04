/**
 * Kinetics generators — half-life by reaction order, and activation energy from
 * two rate constants (Arrhenius). The Arrhenius generator draws a known Ea,
 * synthesises consistent (k, T) points from it, then the engine recovers Ea —
 * so the answer is guaranteed self-consistent.
 */
import {
  halfLife,
  activationEnergy,
  arrheniusK,
  rateConstantUnit,
  type Order,
} from "@/lib/chemistry/kinetics";
import { draw } from "./build";
import { sigTolerance, fmt, sci } from "./format";
import type { TaskGenerator } from "./types";

export const halfLifeGen: TaskGenerator = {
  id: "kinetics-half-life",
  topic: "Kinetics",
  title: "Half-life",
  difficulties: ["Core"],
  build({ rng }) {
    const p = draw(
      () => {
        const order = rng.pick([0, 1, 2] as const) as Order;
        const a0 = rng.float(0.1, 2, 2);
        const k = rng.float(0.001, 0.4, 4);
        return { order, a0, k };
      },
      ({ order, a0, k }) => {
        const t = halfLife(a0, k, order);
        return t > 2 && t < 5000;
      },
    );
    const t = halfLife(p.a0, p.k, p.order);
    const unit = rateConstantUnit(p.order);
    const formula =
      p.order === 0 ? "t½ = [A]₀ / 2k" : p.order === 1 ? "t½ = ln2 / k" : "t½ = 1 / (k[A]₀)";
    return {
      title: "Half-life",
      prompt: `A ${p.order}-order reaction has k = ${fmt(p.k, 4)} ${unit} and [A]₀ = ${fmt(p.a0, 2)} M. What is its half-life (s)?`,
      given: [
        { label: "Order", value: String(p.order) },
        { label: "k", value: `${fmt(p.k, 4)} ${unit}` },
        { label: "[A]₀", value: `${fmt(p.a0, 2)} M` },
      ],
      answer: { kind: "numeric", value: t, unit: "s", tolerance: sigTolerance(t, 1) },
      hints: [
        "The half-life formula depends on the order.",
        `For ${p.order}-order: ${formula}.`,
      ],
      solution: `${formula} = ${fmt(t, 1)} s${p.order === 1 ? " (independent of [A]₀)" : ""}.`,
      toolHref: "/reactions",
    };
  },
};

export const arrheniusGen: TaskGenerator = {
  id: "kinetics-arrhenius",
  topic: "Kinetics",
  title: "Activation energy (Arrhenius)",
  difficulties: ["Challenge"],
  build({ rng }) {
    const p = draw(
      () => {
        const eaTrue = rng.int(30, 150); // kJ/mol
        const A = 1e13;
        const T1 = rng.int(280, 330);
        const T2 = T1 + rng.int(20, 80);
        return { eaTrue, A, T1, T2 };
      },
      () => true,
    );
    const k1 = arrheniusK(p.A, p.eaTrue, p.T1);
    const k2 = arrheniusK(p.A, p.eaTrue, p.T2);
    const ea = activationEnergy(k1, p.T1, k2, p.T2); // recovers eaTrue
    return {
      title: "Activation energy",
      prompt: `A reaction's rate constant is k₁ = ${sci(k1, 2)} s⁻¹ at ${p.T1} K and k₂ = ${sci(k2, 2)} s⁻¹ at ${p.T2} K. Find the activation energy (kJ/mol).`,
      given: [
        { label: "k₁, T₁", value: `${sci(k1, 2)} s⁻¹, ${p.T1} K` },
        { label: "k₂, T₂", value: `${sci(k2, 2)} s⁻¹, ${p.T2} K` },
      ],
      answer: { kind: "numeric", value: ea, unit: "kJ/mol", tolerance: sigTolerance(ea, 1) },
      hints: [
        "Use the two-point Arrhenius form: ln(k₂/k₁) = −(Ea/R)(1/T₂ − 1/T₁).",
        "Solve for Ea, then convert J/mol to kJ/mol.",
      ],
      solution: `Ea = −R·ln(k₂/k₁) / (1/T₂ − 1/T₁) = ${fmt(ea, 1)} kJ/mol.`,
      toolHref: "/reactions",
    };
  },
};
