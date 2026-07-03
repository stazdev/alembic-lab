/**
 * Guided-task progress (§2.3). In-memory for now — persists across client
 * navigation within a session; localStorage persistence is a follow-up.
 */
import { create } from "zustand";

interface TasksState {
  completed: string[];
  isComplete: (id: string) => boolean;
  markComplete: (id: string) => void;
  reset: () => void;
}

export const useTasks = create<TasksState>((set, get) => ({
  completed: [],
  isComplete: (id) => get().completed.includes(id),
  markComplete: (id) =>
    set((state) =>
      state.completed.includes(id)
        ? state
        : { completed: [...state.completed, id] },
    ),
  reset: () => set({ completed: [] }),
}));
