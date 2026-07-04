"use client";

import { Check } from "lucide-react";
import type { Task } from "@/data/tasks";
import { useTasks } from "@/lib/stores/tasksStore";
import { useMounted } from "@/lib/hooks/useMounted";
import { Pill } from "@/components/ui/Pill";
import { cn } from "@/lib/utils";

export function TaskCard({
  task,
  active,
  onSelect,
}: {
  task: Task;
  active: boolean;
  onSelect: () => void;
}) {
  // Gate the persisted read so SSR and first client render agree (no checkmark
  // flash / hydration mismatch); the real state appears after mount.
  const mounted = useMounted();
  const completed = useTasks((s) => s.isComplete(task.id)) && mounted;
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full rounded-ctrl border p-3 text-left transition",
        active
          ? "border-accent-strong bg-surface ring-1 ring-accent-strong/30"
          : "border-line bg-surface hover:border-line-strong",
      )}
    >
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <Pill tone="soft">{task.topic}</Pill>
        {completed ? (
          <span className="grid h-5 w-5 place-items-center rounded-full bg-accent text-accent-ink">
            <Check className="h-3.5 w-3.5" />
          </span>
        ) : (
          <span className="text-[11px] text-ink-3">{task.difficulty}</span>
        )}
      </div>
      <div className="text-sm font-medium text-ink">{task.title}</div>
    </button>
  );
}
