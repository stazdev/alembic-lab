"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Check, Eye, EyeOff, Loader2, RotateCcw, Sparkles, Trash2, X } from "lucide-react";
import { usePrefs } from "@/lib/stores/prefsStore";
import { useTasks } from "@/lib/stores/tasksStore";
import { useTour } from "@/lib/stores/tourStore";
import { usePractice } from "@/lib/stores/practiceStore";
import { useAi, AI_MODELS } from "@/lib/stores/aiStore";
import { validateKey } from "@/lib/ai/gemini";
import { TASKS } from "@/data/tasks";
import { ELEMENTS } from "@/data/elements";
import { REAGENTS } from "@/lib/chemistry/reagents";
import { MOLECULE_LIBRARY } from "@/data/moleculeLibrary";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const OK = "#3f8f5a";
const ERR = "#c0492e";

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
  const resetPractice = usePractice((s) => s.reset);
  const apiKey = useAi((s) => s.apiKey);
  const model = useAi((s) => s.model);
  const aiEnabled = useAi((s) => s.enabled);
  const setApiKey = useAi((s) => s.setApiKey);
  const setModel = useAi((s) => s.setModel);
  const setAiEnabled = useAi((s) => s.setEnabled);
  const resetAi = useAi((s) => s.reset);
  const [confirmTasks, setConfirmTasks] = useState(false);
  const [confirmAll, setConfirmAll] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [test, setTest] = useState<{ status: "idle" | "testing" | "ok" | "error"; msg?: string }>({
    status: "idle",
  });

  const done = mounted ? completed.length : 0;
  const seenTours = mounted ? toursSeen.length : 0;
  const keyValue = mounted ? apiKey : "";

  async function testKey() {
    setTest({ status: "testing" });
    const r = await validateKey(apiKey.trim(), model);
    setTest(r.ok ? { status: "ok" } : { status: "error", msg: r.error });
  }

  function clearAll() {
    resetTasks();
    resetTours();
    resetPractice();
    resetAi();
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
    <div className="mt-8 grid max-w-5xl gap-6 lg:grid-cols-2 lg:items-start">
      <div className="space-y-6">
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

      {/* AI assistant */}
      <section className="rounded-card border border-line bg-surface p-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-base font-semibold text-ink">AI assistant</h2>
          <Switch
            checked={mounted && aiEnabled}
            onChange={setAiEnabled}
            label="Enable AI features"
          />
        </div>
        <p className="mt-1 text-xs leading-relaxed text-ink-2">
          Optional. Bring your own Google Gemini API key to unlock the tutor
          chat, explanations, practice hints, and molecule insights. Your key is
          stored <span className="font-medium text-ink">only in this browser</span>{" "}
          and sent directly to Google when you use an AI feature — never to
          Alembic (there is no server). Treat it like a password; don&rsquo;t use
          a shared computer.
        </p>

        {/* Key */}
        <div className="mt-4">
          <label className="mb-1 block text-xs font-medium text-ink-2">
            Gemini API key
          </label>
          <div className="flex items-center gap-2">
            <div className="flex flex-1 items-center rounded-ctrl border border-line bg-surface px-3 transition focus-within:border-ink-2">
              <input
                type={showKey ? "text" : "password"}
                value={keyValue}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setTest({ status: "idle" });
                }}
                placeholder="Paste your Gemini API key"
                autoComplete="off"
                spellCheck={false}
                aria-label="Gemini API key"
                className="h-11 w-full bg-transparent text-sm text-ink placeholder:text-ink-3 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                aria-label={showKey ? "Hide key" : "Show key"}
                className="ml-2 shrink-0 text-ink-3 transition hover:text-ink"
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <Button
              variant="soft"
              size="sm"
              onClick={testKey}
              disabled={!keyValue.trim() || test.status === "testing"}
            >
              {test.status === "testing" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Test"
              )}
            </Button>
          </div>
          {test.status === "ok" && (
            <p className="mt-1.5 inline-flex items-center gap-1 text-xs" style={{ color: OK }}>
              <Check className="h-3.5 w-3.5" /> Key works.
            </p>
          )}
          {test.status === "error" && (
            <p className="mt-1.5 inline-flex items-center gap-1 text-xs" style={{ color: ERR }}>
              <X className="h-3.5 w-3.5" /> {test.msg}
            </p>
          )}
          <div className="mt-2 flex items-center gap-3">
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-medium text-ink-2 underline transition hover:text-ink"
            >
              Get a key
            </a>
            {mounted && apiKey && (
              <button
                type="button"
                onClick={() => {
                  setApiKey("");
                  setTest({ status: "idle" });
                }}
                className="text-xs text-ink-2 transition hover:text-ink"
              >
                Remove key
              </button>
            )}
          </div>
        </div>

        {/* Model */}
        <div className="mt-4">
          <label className="mb-1.5 block text-xs font-medium text-ink-2">Model</label>
          <div className="flex flex-wrap gap-1.5">
            {AI_MODELS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setModel(m.id)}
                aria-pressed={mounted && model === m.id}
                title={m.note}
                className={cn(
                  "rounded-pill px-3 py-1.5 text-xs font-medium transition",
                  mounted && model === m.id
                    ? "bg-ink text-on-dark"
                    : "border border-line bg-surface text-ink-2 hover:text-ink",
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-ink-3">
            2.5 Flash is fast and free-tier friendly. Newer models may need to be
            enabled on your key.
          </p>
        </div>
      </section>
      </div>

      <div className="space-y-6">
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
    </div>
  );
}
