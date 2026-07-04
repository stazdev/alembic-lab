/**
 * Practice mastery — per-generator stats for the procedural question engine.
 * Because generated questions are unlimited, progress is tracked as mastery per
 * generator (attempts, accuracy, streak) rather than a fixed completed[] list.
 * Persisted to localStorage.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface GenStat {
  attempts: number;
  correct: number;
  /** Current consecutive-correct run. */
  streak: number;
  /** Best streak achieved. */
  best: number;
  mastered: boolean;
}

const EMPTY: GenStat = { attempts: 0, correct: 0, streak: 0, best: 0, mastered: false };

/** Consecutive correct answers needed to count a generator as mastered. */
export const MASTERY_STREAK = 3;

interface PracticeState {
  stats: Record<string, GenStat>;
  statFor: (generatorId: string) => GenStat;
  record: (generatorId: string, correct: boolean) => void;
  reset: () => void;
}

export const usePractice = create<PracticeState>()(
  persist(
    (set, get) => ({
      stats: {},
      statFor: (id) => get().stats[id] ?? EMPTY,
      record: (id, correct) =>
        set((state) => {
          const prev = state.stats[id] ?? EMPTY;
          const streak = correct ? prev.streak + 1 : 0;
          const next: GenStat = {
            attempts: prev.attempts + 1,
            correct: prev.correct + (correct ? 1 : 0),
            streak,
            best: Math.max(prev.best, streak),
            mastered: prev.mastered || streak >= MASTERY_STREAK,
          };
          return { stats: { ...state.stats, [id]: next } };
        }),
      reset: () => set({ stats: {} }),
    }),
    { name: "alembic-practice", partialize: (s) => ({ stats: s.stats }) },
  ),
);
