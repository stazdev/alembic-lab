"use client";

import { useEffect, useState, type ReactNode } from "react";
import { RotateCcw } from "lucide-react";
import { usePrefs } from "@/lib/stores/prefsStore";
import { useTasks } from "@/lib/stores/tasksStore";
import { TASKS } from "@/data/tasks";
import { cn } from "@/lib/utils";

const STACK = [
  "Next.js",
  "React Three Fiber",
  "KaTeX + mhchem",
  "RDKit.js",
  "3Dmol.js",
  "Kekulé.js",
  "Zustand",
  "Tailwind CSS",
];

function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors",
        checked ? "bg-accent-strong" : "bg-line-strong",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-5 w-5 rounded-full bg-surface shadow-soft transition-all",
          checked ? "left-[22px]" : "left-0.5",
        )}
      />
    </button>
  );
}

function Row({
  title,
  desc,
  children,
}: {
  title: string;
  desc: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <div className="text-sm font-medium text-ink">{title}</div>
        <div className="mt-0.5 text-xs text-ink-2">{desc}</div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export function SettingsView() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const reduceMotion = usePrefs((s) => s.reduceMotion);
  const setReduceMotion = usePrefs((s) => s.setReduceMotion);
  const completed = useTasks((s) => s.completed);
  const resetTasks = useTasks((s) => s.reset);
  const [confirm, setConfirm] = useState(false);

  const done = mounted ? completed.length : 0;

  return (
    <div className="mt-8 max-w-2xl space-y-6">
      <section className="rounded-card border border-line bg-surface p-5">
        <h2 className="text-base font-semibold text-ink">
          Appearance &amp; accessibility
        </h2>
        <div className="mt-1 divide-y divide-line">
          <Row
            title="Reduce motion"
            desc="Minimise animations and transitions across the app."
          >
            <Switch
              checked={mounted && reduceMotion}
              onChange={setReduceMotion}
              label="Reduce motion"
            />
          </Row>
        </div>
      </section>

      <section className="rounded-card border border-line bg-surface p-5">
        <h2 className="text-base font-semibold text-ink">Data &amp; progress</h2>
        <p className="mt-1 text-xs leading-relaxed text-ink-2">
          Alembic keeps your task progress and preferences in this browser only —
          nothing leaves your device.
        </p>
        <div className="mt-1 divide-y divide-line">
          <Row
            title="Guided-task progress"
            desc={`${done} of ${TASKS.length} tasks marked complete.`}
          >
            {confirm ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    resetTasks();
                    setConfirm(false);
                  }}
                  className="rounded-pill bg-[#c0492e] px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-90"
                >
                  Confirm reset
                </button>
                <button
                  type="button"
                  onClick={() => setConfirm(false)}
                  className="rounded-pill border border-line px-3 py-1.5 text-xs font-medium text-ink-2 transition hover:text-ink"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirm(true)}
                disabled={done === 0}
                className="inline-flex items-center gap-1 rounded-pill border border-line px-3 py-1.5 text-xs font-medium text-ink-2 transition hover:text-ink disabled:pointer-events-none disabled:opacity-40"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reset
              </button>
            )}
          </Row>
        </div>
      </section>

      <section className="rounded-card border border-line bg-surface p-5">
        <h2 className="text-base font-semibold text-ink">About Alembic</h2>
        <p className="mt-1 text-xs leading-relaxed text-ink-2">
          An interactive virtual chemistry &amp; biochemistry laboratory. Every
          result — pH, ΔG, precipitates, safety — is computed from real chemistry
          engines, not scripted.
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {STACK.map((t) => (
            <span
              key={t}
              className="rounded-pill bg-surface-2 px-2.5 py-1 text-[11px] text-ink-2"
            >
              {t}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
