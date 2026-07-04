"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Award, Check } from "lucide-react";
import { usePrefs } from "@/lib/stores/prefsStore";
import { useTasks } from "@/lib/stores/tasksStore";
import { TASKS, TASK_TOPICS, type TaskDifficulty } from "@/data/tasks";
import { cn } from "@/lib/utils";

const DIFFICULTIES: TaskDifficulty[] = ["Intro", "Core", "Challenge"];

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-ctrl bg-surface-2 px-3 py-3 text-center">
      <div className="text-xl font-semibold tabular-nums text-ink">{value}</div>
      <div className="mt-0.5 text-[11px] text-ink-2">{label}</div>
    </div>
  );
}

export function ProfileView() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const displayName = usePrefs((s) => s.displayName);
  const setDisplayName = usePrefs((s) => s.setDisplayName);
  const title = usePrefs((s) => s.title);
  const setTitle = usePrefs((s) => s.setTitle);
  const completedRaw = useTasks((s) => s.completed);

  const completed = mounted ? completedRaw : [];
  const name = mounted ? displayName : "";
  const roleText = mounted ? title : "";
  const done = completed.length;
  const initial = (name.trim()[0] ?? "🧪").toUpperCase();
  const pct = Math.round((done / TASKS.length) * 100);

  const byTopic = TASK_TOPICS.map((topic) => {
    const t = TASKS.filter((x) => x.topic === topic);
    return {
      topic,
      done: t.filter((x) => completed.includes(x.id)).length,
      total: t.length,
    };
  });
  const topicsStarted = byTopic.filter((t) => t.done > 0).length;
  const topicsMastered = byTopic.filter((t) => t.total > 0 && t.done === t.total).length;

  const byDifficulty = DIFFICULTIES.map((d) => {
    const t = TASKS.filter((x) => x.difficulty === d);
    return {
      difficulty: d,
      done: t.filter((x) => completed.includes(x.id)).length,
      total: t.length,
    };
  });

  const achievements = [
    { label: "First steps", desc: "Complete your first task", earned: done >= 1 },
    { label: "On a roll", desc: "Complete five tasks", earned: done >= 5 },
    { label: "Halfway there", desc: "Reach 50% overall", earned: pct >= 50 },
    { label: "Topic master", desc: "Finish every task in a topic", earned: topicsMastered >= 1 },
    { label: "Completionist", desc: "Complete every task", earned: done === TASKS.length && TASKS.length > 0 },
  ];

  return (
    <div className="mt-8 grid max-w-5xl gap-6 lg:grid-cols-[minmax(0,360px)_1fr] lg:items-start">
      <div className="space-y-6 lg:sticky lg:top-6">
      {/* Identity */}
      <section className="rounded-card border border-line bg-surface p-5">
        <div className="flex items-start gap-4">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-ink text-2xl font-semibold text-on-dark">
            {initial}
          </div>
          <div className="min-w-0 flex-1 space-y-3">
            <div>
              <label htmlFor="display-name" className="text-[11px] font-medium uppercase tracking-wide text-ink-3">
                Display name
              </label>
              <input
                id="display-name"
                value={name}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Add your name"
                maxLength={40}
                className="mt-1 w-full rounded-ctrl border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-3 focus:border-ink-2 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="title" className="text-[11px] font-medium uppercase tracking-wide text-ink-3">
                Role / focus
              </label>
              <input
                id="title"
                value={roleText}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. A-level student · Organic chemistry"
                maxLength={60}
                className="mt-1 w-full rounded-ctrl border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-3 focus:border-ink-2 focus:outline-none"
              />
            </div>
          </div>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-ink-2">
          Alembic runs entirely in your browser — this profile is local to this
          device. Accounts, saved experiments, and cloud sync arrive with the
          backend.
        </p>
      </section>

      {/* Activity */}
      <section className="rounded-card border border-line bg-surface p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink">Your activity</h2>
          <Link href="/dashboard" className="inline-flex items-center gap-1 text-xs font-medium text-ink-2 transition hover:text-ink">
            Full overview <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat value={`${done}/${TASKS.length}`} label="Tasks done" />
          <Stat value={`${pct}%`} label="Overall" />
          <Stat value={String(topicsStarted)} label="Topics started" />
          <Stat value={String(topicsMastered)} label="Topics mastered" />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {byDifficulty.map((d) => (
            <span key={d.difficulty} className="rounded-pill bg-surface-2 px-3 py-1 text-[11px] text-ink-2">
              {d.difficulty}:{" "}
              <span className="font-semibold text-ink">
                {d.done}/{d.total}
              </span>
            </span>
          ))}
        </div>
      </section>
      </div>

      <div className="space-y-6">
      {/* Progress by topic */}
      <section className="rounded-card border border-line bg-surface p-5">
        <h2 className="text-base font-semibold text-ink">Progress by topic</h2>
        <div className="mt-3 space-y-2">
          {byTopic.map((t) => (
            <div key={t.topic} className="flex items-center gap-3">
              <span className="w-28 shrink-0 truncate text-xs text-ink-2">{t.topic}</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
                <div
                  className="h-full rounded-full bg-ink/70 transition-all duration-500"
                  style={{ width: `${t.total ? (t.done / t.total) * 100 : 0}%` }}
                />
              </div>
              <span className="w-8 shrink-0 text-right text-[11px] tabular-nums text-ink-3">
                {t.done}/{t.total}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Achievements */}
      <section className="rounded-card border border-line bg-surface p-5">
        <h2 className="text-base font-semibold text-ink">Achievements</h2>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {achievements.map((a) => (
            <div
              key={a.label}
              className={cn(
                "flex items-center gap-3 rounded-ctrl border p-3",
                a.earned
                  ? "border-accent-strong/40 bg-accent-soft"
                  : "border-line bg-surface-2 opacity-70",
              )}
            >
              <div
                className={cn(
                  "grid h-8 w-8 shrink-0 place-items-center rounded-full",
                  a.earned ? "bg-accent-strong text-accent-ink" : "bg-line-strong text-ink-3",
                )}
              >
                {a.earned ? <Check className="h-4 w-4" /> : <Award className="h-4 w-4" />}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-ink">{a.label}</div>
                <div className="text-[11px] text-ink-2">{a.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
      </div>
    </div>
  );
}
