/**
 * Guided-task progress (§2.3). Persisted to localStorage so completion survives
 * reloads and feeds the Dashboard overview.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface TasksState {
  completed: string[];
  isComplete: (id: string) => boolean;
  markComplete: (id: string) => void;
  reset: () => void;
}

export const useTasks = create<TasksState>()(
  persist(
    (set, get) => ({
      completed: [],
      isComplete: (id) => get().completed.includes(id),
      markComplete: (id) =>
        set((state) =>
          state.completed.includes(id)
            ? state
            : { completed: [...state.completed, id] },
        ),
      reset: () => set({ completed: [] }),
    }),
    { name: "alembic-tasks", partialize: (s) => ({ completed: s.completed }) },
  ),
);
