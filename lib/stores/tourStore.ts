/**
 * First-time walkthrough state. Which tours have been seen persists to
 * localStorage; the currently-running tour and step are ephemeral.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface TourState {
  /** Tour ids the user has completed or dismissed. */
  seen: string[];
  activeTourId: string | null;
  step: number;
  start: (id: string) => void;
  /** Ends the active tour and marks it as seen. */
  stop: () => void;
  next: () => void;
  prev: () => void;
  resetSeen: () => void;
}

export const useTour = create<TourState>()(
  persist(
    (set, get) => ({
      seen: [],
      activeTourId: null,
      step: 0,
      start: (id) => set({ activeTourId: id, step: 0 }),
      stop: () => {
        const id = get().activeTourId;
        set((s) => ({
          activeTourId: null,
          step: 0,
          seen: id && !s.seen.includes(id) ? [...s.seen, id] : s.seen,
        }));
      },
      next: () => set((s) => ({ step: s.step + 1 })),
      prev: () => set((s) => ({ step: Math.max(0, s.step - 1) })),
      resetSeen: () => set({ seen: [] }),
    }),
    { name: "alembic-tour", partialize: (s) => ({ seen: s.seen }) },
  ),
);
