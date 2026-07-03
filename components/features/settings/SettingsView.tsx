"use client";

import { useEffect, useState, type ReactNode } from "react";
import { RotateCcw, Sparkles, Trash2 } from "lucide-react";
import { usePrefs } from "@/lib/stores/prefsStore";
import { useTasks } from "@/lib/stores/tasksStore";
import { useTour } from "@/lib/stores/tourStore";
import { TASKS } from "@/data/tasks";
import { ELEMENTS } from "@/data/elements";
import { REAGENTS } from "@/lib/chemistry/reagents";
import { MOLECULE_LIBRARY } from "@/data/moleculeLibrary";
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

function DangerAction({
  confirmed,
  onArm,
  onConfirm,
  onCancel,
  label,
  icon,
  disabled,
}: {
  confirmed: boolean;
  onArm: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  label: string;
  icon: ReactNode;
  disabled?: boolean;
}) {
  if (confirmed) {
    return (
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={onConfirm}
          className="rounded-pill bg-[#c0492e] px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-90"
        >
          Confirm
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-pill border border-line px-3 py-1.5 text-xs font-medium text-ink-2 transition hover:text-ink"
        >
          Cancel
        </button>
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={onArm}
      disabled={disabled}
      className="inline-flex items-center gap-1 rounded-pill border border-line px-3 py-1.5 text-xs font-medium text-ink-2 transition hover:text-ink disabled:pointer-events-none disabled:opacity-40"
    >
      {icon} {label}
    </button>
  );
}

export function SettingsView() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const reduceMotion = usePrefs((s) => s.reduceMotion);
  const setReduceMotion = usePrefs((s) => s.setReduceMotion);
  const setDisplayName = usePrefs((s) => s.setDisplayName);
  const setTitle = usePrefs((s) => s.setTitle);
  const completed = useTasks((s) => s.completed);
  const resetTasks = useTasks((s) => s.reset);
  const toursSeen = useTour((s) => s.seen);
  const resetTours = useTour((s) => s.resetSeen);
  const [confirmTasks, setConfirmTasks] = useState(false);
  const [confirmAll, setConfirmAll] = useState(false);

  const done = mounted ? completed.length : 0;
  const seenTours = mounted ? toursSeen.length : 0;

  function clearAll() {
    resetTasks();
    resetTours();
    setDisplayName("");
    setTitle("");
    setReduceMotion(false);
    setConfirmAll(false);
  }

  const inside = [
    { value: String(ELEMENTS.length), label: "Elements" },
    { value: String(REAGENTS.length), label: "Reagents & metals" },
    { value: String(MOLECULE_LIBRARY.length), label: "Molecules" },
    { value: String(TASKS.length), label: "Guided tasks" },
  ];

  return (
    <div className="mt-8 max-w-2xl space-y-6">
      {/* Appearance & accessibility */}
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
          <Row
            title="Page walkthroughs"
            desc="Replay the first-time guided tours — they'll run again on each page you visit."
          >
            <button
              type="button"
              onClick={resetTours}
              disabled={seenTours === 0}
              className="inline-flex items-center gap-1 rounded-pill border border-line px-3 py-1.5 text-xs font-medium text-ink-2 transition hover:text-ink disabled:pointer-events-none disabled:opacity-40"
            >
              <Sparkles className="h-3.5 w-3.5" /> Replay
            </button>
          </Row>
        </div>
        <p className="mt-2 text-[11px] text-ink-3">
          Alembic also honours your system &ldquo;reduce motion&rdquo; setting
          automatically.
        </p>
      </section>

      {/* Data & storage */}
      <section className="rounded-card border border-line bg-surface p-5">
        <h2 className="text-base font-semibold text-ink">Data &amp; storage</h2>
        <p className="mt-1 text-xs leading-relaxed text-ink-2">
          Everything stays in this browser only — task progress, your display
          name, and preferences. Nothing leaves your device, and saved benches
          travel as share codes, not stored server-side.
        </p>
        <div className="mt-1 divide-y divide-line">
          <Row
            title="Guided-task progress"
            desc={`${done} of ${TASKS.length} tasks marked complete.`}
          >
            <DangerAction
              confirmed={confirmTasks}
              onArm={() => setConfirmTasks(true)}
              onConfirm={() => {
                resetTasks();
                setConfirmTasks(false);
              }}
              onCancel={() => setConfirmTasks(false)}
              label="Reset"
              icon={<RotateCcw className="h-3.5 w-3.5" />}
              disabled={done === 0}
            />
          </Row>
          <Row
            title="Clear all local data"
            desc="Progress, display name, role, and preferences."
          >
            <DangerAction
              confirmed={confirmAll}
              onArm={() => setConfirmAll(true)}
              onConfirm={clearAll}
              onCancel={() => setConfirmAll(false)}
              label="Clear all"
              icon={<Trash2 className="h-3.5 w-3.5" />}
            />
          </Row>
        </div>
      </section>

      {/* About */}
      <section className="rounded-card border border-line bg-surface p-5">
        <h2 className="text-base font-semibold text-ink">About Alembic</h2>
        <p className="mt-1 text-xs leading-relaxed text-ink-2">
          An interactive virtual chemistry &amp; biochemistry laboratory. Every
          result — pH, ΔG, precipitates, safety — is computed from real chemistry
          engines, not scripted.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {inside.map((s) => (
            <div
              key={s.label}
              className="rounded-ctrl bg-surface-2 px-3 py-2 text-center"
            >
              <div className="text-lg font-semibold tabular-nums text-ink">
                {s.value}
              </div>
              <div className="text-[10px] text-ink-2">{s.label}</div>
            </div>
          ))}
        </div>
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
