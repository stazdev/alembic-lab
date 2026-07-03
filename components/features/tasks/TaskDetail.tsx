"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Lightbulb, RotateCcw, X } from "lucide-react";
import type { Task } from "@/data/tasks";
import { useTasks } from "@/lib/stores/tasksStore";
import { Molecule3D } from "@/components/chem/Molecule3D";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Pill } from "@/components/ui/Pill";
import { cn } from "@/lib/utils";

const OK = "#3f8f5a";
const ERR = "#c0492e";

export function TaskDetail({ task }: { task: Task }) {
  const [numeric, setNumeric] = useState("");
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(0);
  const [result, setResult] = useState<boolean | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const markComplete = useTasks((s) => s.markComplete);
  const completed = useTasks((s) => s.isComplete(task.id));

  function check() {
    let correct = false;
    if (task.answer.kind === "numeric") {
      const v = parseFloat(numeric);
      correct =
        Number.isFinite(v) &&
        Math.abs(v - task.answer.value) <= task.answer.tolerance;
    } else {
      correct = selected === task.answer.correctIndex;
    }
    setResult(correct);
    if (correct) markComplete(task.id);
  }

  function reset() {
    setNumeric("");
    setSelected(null);
    setRevealed(0);
    setResult(null);
    setShowSolution(false);
  }

  const canCheck =
    task.answer.kind === "numeric" ? numeric.trim() !== "" : selected !== null;

  return (
    <div>
      <div className="mb-1.5 flex flex-wrap items-center gap-2">
        <Pill tone="soft">{task.topic}</Pill>
        <Pill tone="outline">{task.difficulty}</Pill>
        {completed && (
          <span
            className="inline-flex items-center gap-1 text-xs font-medium"
            style={{ color: OK }}
          >
            <Check className="h-3.5 w-3.5" /> Completed
          </span>
        )}
      </div>
      <h2 className="text-xl font-semibold text-ink">{task.title}</h2>

      <div className="mt-3">
        <div className="text-xs font-medium text-ink-3">Objectives</div>
        <ul className="mt-1 space-y-1">
          {task.objectives.map((o, i) => (
            <li key={i} className="flex gap-2 text-sm text-ink-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ink-3" />
              {o}
            </li>
          ))}
        </ul>
      </div>

      {task.given && (
        <div className="mt-3 flex flex-wrap gap-2">
          {task.given.map((g) => (
            <span
              key={g.label}
              className="rounded-pill bg-surface-2 px-3 py-1 text-xs text-ink-2"
            >
              {g.label} ={" "}
              <span className="font-medium text-ink">{g.value}</span>
            </span>
          ))}
        </div>
      )}

      <p className="mt-4 rounded-ctrl bg-surface-2 p-4 text-sm leading-relaxed text-ink">
        {task.prompt}
      </p>

      {task.moleculeKey && (
        <div className="mt-4">
          <div className="relative h-64 overflow-hidden rounded-card border border-line bg-surface-2">
            <Molecule3D
              moleculeKey={task.moleculeKey}
              representation="ball-stick"
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-2 text-center text-[11px] text-ink-3">
              drag to rotate · scroll to zoom
            </div>
          </div>
        </div>
      )}

      {/* Answer */}
      {task.answer.kind === "numeric" ? (
        <Field
          label="Your answer"
          value={numeric}
          onChange={(v) => {
            setNumeric(v);
            setResult(null);
          }}
          unit={task.answer.unit || undefined}
          inputMode="decimal"
          className="mt-4 max-w-48"
        />
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          {task.answer.options.map((opt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setSelected(i);
                setResult(null);
              }}
              className={cn(
                "rounded-pill border px-4 py-2 text-sm font-medium transition",
                selected === i
                  ? "border-ink bg-ink text-on-dark"
                  : "border-line bg-surface text-ink hover:border-line-strong",
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button variant="accent" size="sm" onClick={check} disabled={!canCheck}>
          Check answer
        </Button>
        <Button variant="ghost" size="sm" onClick={reset}>
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
        {result === true && (
          <span
            className="inline-flex items-center gap-1 text-sm font-medium"
            style={{ color: OK }}
          >
            <Check className="h-4 w-4" /> Correct!
          </span>
        )}
        {result === false && (
          <span
            className="inline-flex items-center gap-1 text-sm font-medium"
            style={{ color: ERR }}
          >
            <X className="h-4 w-4" /> Not quite — try a hint.
          </span>
        )}
      </div>

      {/* Hints */}
      <div className="mt-5 border-t border-line pt-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-ink-3">
            Hints ({revealed}/{task.hints.length})
          </span>
          {revealed < task.hints.length && (
            <Button
              variant="soft"
              size="sm"
              onClick={() => setRevealed((r) => r + 1)}
            >
              <Lightbulb className="h-4 w-4" />
              {revealed === 0 ? "Hint" : "Next hint"}
            </Button>
          )}
        </div>
        {revealed > 0 && (
          <ol className="mt-3 space-y-2">
            {task.hints.slice(0, revealed).map((h, i) => (
              <li
                key={i}
                className="flex gap-2 rounded-ctrl bg-surface-2 p-3 text-sm text-ink-2"
              >
                <span className="font-semibold text-ink">{i + 1}.</span>
                {h}
              </li>
            ))}
          </ol>
        )}
      </div>

      {/* Solution */}
      <div className="mt-4">
        {!showSolution ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSolution(true)}
          >
            Show solution
          </Button>
        ) : (
          <div className="rounded-ctrl border border-line bg-surface-2 p-4">
            <div className="mb-1 text-xs font-medium text-ink-3">Solution</div>
            <p className="text-sm leading-relaxed text-ink">{task.solution}</p>
          </div>
        )}
      </div>

      {task.toolHref && (
        <Link
          href={task.toolHref}
          className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-ink-2 transition hover:text-ink"
        >
          Practice in the calculators <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}
