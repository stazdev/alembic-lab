"use client";

import { useState } from "react";
import { TASKS, TASK_TOPICS, type TaskTopic } from "@/data/tasks";
import { useTasks } from "@/lib/stores/tasksStore";
import { TaskCard } from "./TaskCard";
import { TaskDetail } from "./TaskDetail";
import { Card } from "@/components/ui/Card";
import { SegmentedControl, type SegmentOption } from "@/components/ui/SegmentedControl";

type Filter = TaskTopic | "all";

const OPTIONS: SegmentOption<Filter>[] = [
  { value: "all", label: "All" },
  ...TASK_TOPICS.map((t) => ({ value: t as Filter, label: t })),
];

export function TasksView() {
  const [topic, setTopic] = useState<Filter>("all");
  const [selectedId, setSelectedId] = useState(TASKS[0].id);
  const completedCount = useTasks((s) => s.completed.length);

  const filtered = topic === "all" ? TASKS : TASKS.filter((t) => t.topic === topic);
  const selected = TASKS.find((t) => t.id === selectedId) ?? TASKS[0];

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="-mx-1 overflow-x-auto px-1 pb-1">
          <SegmentedControl
            layoutId="tasks-topic"
            aria-label="Filter tasks by topic"
            options={OPTIONS}
            value={topic}
            onChange={setTopic}
          />
        </div>
        <span className="shrink-0 text-xs text-ink-2">
          <span className="font-semibold text-ink">{completedCount}</span> of {TASKS.length} complete
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
        <div className="space-y-2">
          {filtered.map((t) => (
            <TaskCard
              key={t.id}
              task={t}
              active={t.id === selectedId}
              onSelect={() => setSelectedId(t.id)}
            />
          ))}
        </div>
        <Card className="p-5 lg:p-6">
          <TaskDetail key={selected.id} task={selected} />
        </Card>
      </div>
    </div>
  );
}
