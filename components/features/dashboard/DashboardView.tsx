"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  FlaskConical,
  GraduationCap,
  Hexagon,
  LayoutGrid,
  Package,
  Sigma,
} from "lucide-react";
import { TASKS, TASK_TOPICS } from "@/data/tasks";
import { useTasks } from "@/lib/stores/tasksStore";
import { ELEMENTS } from "@/data/elements";
import { REAGENTS } from "@/lib/chemistry/reagents";
import { MOLECULE_LIBRARY } from "@/data/moleculeLibrary";
import { cn } from "@/lib/utils";

const MODULES = [
  { href: "/", icon: Package, title: "Inventory Room", desc: "Pick glassware and instruments; stage your bench." },
  { href: "/sandbox", icon: FlaskConical, title: "Sandbox", desc: "Mix reagents and metals; watch real reactions unfold.", dark: true },
  { href: "/reactions", icon: Sigma, title: "Reactions", desc: "Balancers, stoichiometry, pH, kinetics, mechanisms & more." },
  { href: "/tasks", icon: GraduationCap, title: "Guided Tasks", desc: "Auto-graded problems with staged hints." },
  { href: "/periodic-table", icon: LayoutGrid, title: "Periodic Table", desc: "118 elements, trends, and 3D atomic models." },
  { href: "/molecules", icon: Hexagon, title: "Molecules", desc: "Interactive 2D & 3D structures — library or PubChem." },
];

function StatTile({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-card bg-surface px-5 py-4 shadow-soft">
      <div className="text-3xl font-semibold tabular-nums text-ink">{value}</div>
      <div className="mt-0.5 text-xs text-ink-2">{label}</div>
    </div>
  );
}

export function DashboardView() {
  // Avoid an SSR/client mismatch: persisted progress only shows after mount.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const stored = useTasks((s) => s.completed);
  const completed = mounted ? stored : [];

  const total = TASKS.length;
  const done = completed.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const byTopic = TASK_TOPICS.map((topic) => {
    const topicTasks = TASKS.filter((t) => t.topic === topic);
    return {
      topic,
      done: topicTasks.filter((t) => completed.includes(t.id)).length,
      total: topicTasks.length,
    };
  });

  return (
    <div className="mt-8 space-y-8">
      {/* Stats */}
      <div data-tour="dashboard-stats" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile value={`${done}/${total}`} label="Tasks complete" />
        <StatTile value={String(ELEMENTS.length)} label="Elements" />
        <StatTile value={String(REAGENTS.length)} label="Reagents & metals" />
        <StatTile value={String(MOLECULE_LIBRARY.length)} label="Bundled molecules" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        {/* Progress */}
        <div data-tour="dashboard-progress" className="rounded-card border border-line bg-surface p-5">
          <div className="flex items-baseline justify-between">
            <h2 className="text-base font-semibold text-ink">Task progress</h2>
            <span className="text-sm font-semibold tabular-nums text-ink">{pct}%</span>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full bg-accent-strong transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-4 space-y-2">
            {byTopic.map((t) => (
              <div key={t.topic} className="flex items-center gap-3">
                <span className="w-28 shrink-0 truncate text-xs text-ink-2">
                  {t.topic}
                </span>
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
          <Link
            href="/tasks"
            className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-ink-2 transition hover:text-ink"
          >
            Open guided tasks <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Explore */}
        <div data-tour="dashboard-modules">
          <h2 className="mb-3 text-base font-semibold text-ink">Explore the lab</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {MODULES.map((m) => (
              <Link
                key={m.href}
                href={m.href}
                className={cn(
                  "group flex flex-col gap-2 rounded-card border p-4 transition",
                  m.dark
                    ? "border-dark bg-dark text-on-dark hover:bg-dark-2"
                    : "border-line bg-surface hover:border-line-strong",
                )}
              >
                <div
                  className={cn(
                    "grid h-9 w-9 place-items-center rounded-ctrl",
                    m.dark ? "bg-on-dark/10 text-on-dark" : "bg-surface-2 text-ink",
                  )}
                >
                  <m.icon className="h-5 w-5" />
                </div>
                <div className={cn("text-sm font-semibold", m.dark ? "text-on-dark" : "text-ink")}>
                  {m.title}
                </div>
                <p className={cn("text-xs leading-relaxed", m.dark ? "text-on-dark-2" : "text-ink-2")}>
                  {m.desc}
                </p>
                <span
                  className={cn(
                    "mt-auto inline-flex items-center gap-1 pt-1 text-xs font-medium",
                    m.dark ? "text-on-dark" : "text-ink-2 group-hover:text-ink",
                  )}
                >
                  Open <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
