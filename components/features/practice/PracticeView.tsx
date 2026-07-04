"use client";

/**
 * Practice mode — drives the procedural generators. Pick a topic/generator and
 * difficulty; a seeded question renders; "New question" reseeds. The current
 * question lives in the URL (?g&s&d) so it's shareable and reproducible, and
 * per-generator mastery accrues in the practice store.
 */
import { useCallback, useEffect, useState } from "react";
import { Check, Copy, Sparkles } from "lucide-react";
import { GENERATORS, generatorById, generatorsByTopic, generatorTopics } from "@/lib/chemistry/generators/registry";
import { realize } from "@/lib/chemistry/generators/types";
import { freshSeed } from "@/lib/chemistry/generators/rng";
import { usePractice, MASTERY_STREAK } from "@/lib/stores/practiceStore";
import { useMounted } from "@/lib/hooks/useMounted";
import { GeneratedQuestion } from "./GeneratedQuestion";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { cn } from "@/lib/utils";
import type { TaskDifficulty, TaskTopic } from "@/data/tasks";

interface Sel {
  genId: string;
  difficulty: TaskDifficulty;
  seed: number;
}

const TOPIC_OPTIONS = generatorTopics().map((t) => ({ value: t, label: t }));

export function PracticeView() {
  const mounted = useMounted();
  const [sel, setSel] = useState<Sel | null>(null);
  const [copied, setCopied] = useState(false);
  const record = usePractice((s) => s.record);
  const stats = usePractice((s) => s.stats);

  // Initialise from the URL (a shared question) or a fresh random one. Uses
  // freshSeed() / window, so it must run client-side only (avoids SSR mismatch).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const g = params.get("g");
    const gen = (g && generatorById(g)) || GENERATORS[0];
    const dParam = params.get("d") as TaskDifficulty | null;
    const difficulty =
      dParam && gen.difficulties.includes(dParam) ? dParam : gen.difficulties[0];
    const sParam = params.get("s");
    const seed =
      sParam && Number.isFinite(Number(sParam)) ? Number(sParam) >>> 0 : freshSeed();
    setSel({ genId: gen.id, difficulty, seed });
  }, []);

  // Reflect the current question in the URL so it can be copied / assigned.
  useEffect(() => {
    if (!sel) return;
    window.history.replaceState(null, "", `?g=${sel.genId}&s=${sel.seed}&d=${sel.difficulty}`);
    setCopied(false);
  }, [sel]);

  const onGraded = useCallback(
    (correct: boolean) => {
      if (sel) record(sel.genId, correct);
    },
    [sel, record],
  );

  if (!mounted || !sel) {
    return <div className="mt-8 h-80 animate-pulse rounded-card bg-surface-2" />;
  }

  const gen = generatorById(sel.genId) ?? GENERATORS[0];
  const task = realize(gen, sel.seed, sel.difficulty);
  const topicGens = generatorsByTopic(gen.topic);
  const stat = stats[gen.id] ?? { attempts: 0, correct: 0, streak: 0, best: 0, mastered: false };
  const accuracy = stat.attempts ? Math.round((stat.correct / stat.attempts) * 100) : 0;

  const pickTopic = (t: string) => {
    const first = generatorsByTopic(t as TaskTopic)[0];
    setSel({ genId: first.id, difficulty: first.difficulties[0], seed: freshSeed() });
  };
  const pickGen = (id: string) => {
    const g = generatorById(id)!;
    const difficulty = g.difficulties.includes(sel.difficulty)
      ? sel.difficulty
      : g.difficulties[0];
    setSel({ genId: id, difficulty, seed: freshSeed() });
  };
  const pickDifficulty = (d: TaskDifficulty) => setSel({ ...sel, difficulty: d, seed: freshSeed() });
  const newQuestion = () => setSel({ ...sel, seed: freshSeed() });
  const copyLink = () => {
    navigator.clipboard
      ?.writeText(window.location.href)
      .then(() => setCopied(true))
      .catch(() => undefined);
  };

  return (
    <div className="mt-8 space-y-5">
      {/* Topic */}
      <div data-tour="practice-topic" className="-mx-1 overflow-x-auto px-1 pb-1">
        <SegmentedControl
          layoutId="practice-topic"
          aria-label="Practice topic"
          options={TOPIC_OPTIONS}
          value={gen.topic}
          onChange={pickTopic}
        />
      </div>

      {/* Generator + difficulty */}
      <div data-tour="practice-generator" className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {topicGens.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => pickGen(g.id)}
              aria-pressed={g.id === gen.id}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-pill px-3.5 py-1.5 text-sm font-medium transition",
                g.id === gen.id
                  ? "bg-ink text-on-dark"
                  : "border border-line bg-surface text-ink-2 hover:text-ink",
              )}
            >
              {(stats[g.id]?.mastered ?? false) && <Sparkles className="h-3.5 w-3.5 text-accent" />}
              {g.title}
            </button>
          ))}
        </div>
        <div className="flex shrink-0 gap-1.5">
          {gen.difficulties.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => pickDifficulty(d)}
              aria-pressed={d === sel.difficulty}
              className={cn(
                "rounded-pill px-3 py-1.5 text-xs font-medium transition",
                d === sel.difficulty
                  ? "bg-accent text-accent-ink"
                  : "border border-line bg-surface text-ink-2 hover:text-ink",
              )}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
        {/* Question */}
        <div data-tour="practice-question" className="rounded-card border border-line bg-surface p-5 lg:p-6">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Pill tone="soft">{gen.topic}</Pill>
            <Pill tone="outline">{sel.difficulty}</Pill>
            <span className="ml-auto text-[11px] tabular-nums text-ink-3">
              seed #{sel.seed}
            </span>
          </div>
          <GeneratedQuestion key={`${sel.genId}-${sel.seed}-${sel.difficulty}`} task={task} onGraded={onGraded} />

          <div data-tour="practice-controls" className="mt-6 flex flex-wrap items-center gap-2 border-t border-line pt-4">
            <Button variant="primary" size="sm" onClick={newQuestion}>
              <Sparkles className="h-4 w-4" />
              New question
            </Button>
            <Button variant="soft" size="sm" onClick={copyLink}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Link copied" : "Share this question"}
            </Button>
          </div>
        </div>

        {/* Mastery */}
        <div data-tour="practice-mastery" className="h-fit rounded-card border border-line bg-surface p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink">Your mastery</h2>
            {stat.mastered && (
              <Pill tone="accent">
                <Sparkles className="h-3 w-3" />
                Mastered
              </Pill>
            )}
          </div>
          <p className="mt-1 text-xs text-ink-2">{gen.title}</p>

          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <Stat value={String(stat.attempts)} label="Attempts" />
            <Stat value={`${accuracy}%`} label="Accuracy" />
            <Stat value={String(stat.streak)} label="Streak" />
          </div>

          <div className="mt-4">
            <div className="mb-1 flex items-center justify-between text-[11px] text-ink-2">
              <span>Streak to mastery</span>
              <span className="tabular-nums">
                {Math.min(stat.streak, MASTERY_STREAK)}/{MASTERY_STREAK}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full bg-accent-strong transition-all duration-500"
                style={{ width: `${Math.min(100, (stat.streak / MASTERY_STREAK) * 100)}%` }}
              />
            </div>
          </div>

          <p className="mt-4 text-[11px] leading-relaxed text-ink-3">
            Answer {MASTERY_STREAK} in a row to master a generator. Questions are
            unlimited — every &ldquo;New question&rdquo; is freshly generated and
            auto-graded by the same engines as the calculators.
          </p>
        </div>
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-ctrl bg-surface-2 px-2 py-2">
      <div className="text-lg font-semibold tabular-nums text-ink">{value}</div>
      <div className="text-[10px] text-ink-2">{label}</div>
    </div>
  );
}
