"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { usePrefs } from "@/lib/stores/prefsStore";
import { useTasks } from "@/lib/stores/tasksStore";
import { TASKS, TASK_TOPICS } from "@/data/tasks";

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-ctrl bg-surface-2 px-4 py-3 text-center">
      <div className="text-2xl font-semibold tabular-nums text-ink">{value}</div>
      <div className="mt-0.5 text-[11px] text-ink-2">{label}</div>
    </div>
  );
}

export function ProfileView() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const displayName = usePrefs((s) => s.displayName);
  const setDisplayName = usePrefs((s) => s.setDisplayName);
  const completed = useTasks((s) => s.completed);

  const name = mounted ? displayName : "";
  const done = mounted ? completed.length : 0;
  const initial = (name.trim()[0] ?? "🧪").toUpperCase();
  const topicsStarted = mounted
    ? TASK_TOPICS.filter((t) =>
        TASKS.some((task) => task.topic === t && completed.includes(task.id)),
      ).length
    : 0;
  const pct = Math.round((done / TASKS.length) * 100);

  return (
    <div className="mt-8 max-w-2xl space-y-6">
      <section className="rounded-card border border-line bg-surface p-5">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-ink text-2xl font-semibold text-on-dark">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <label
              htmlFor="display-name"
              className="text-[11px] font-medium uppercase tracking-wide text-ink-3"
            >
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
        </div>
        <p className="mt-3 text-xs leading-relaxed text-ink-2">
          Alembic runs entirely in your browser — this profile is local to this
          device. Accounts, saved experiments, and cloud sync arrive with the
          backend.
        </p>
      </section>

      <section className="rounded-card border border-line bg-surface p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink">Your activity</h2>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-xs font-medium text-ink-2 transition hover:text-ink"
          >
            Full overview <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-3">
          <Stat value={String(done)} label="Tasks completed" />
          <Stat value={String(topicsStarted)} label="Topics started" />
          <Stat value={`${pct}%`} label="Overall progress" />
        </div>
      </section>
    </div>
  );
}
