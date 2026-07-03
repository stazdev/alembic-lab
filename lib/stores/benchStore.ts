/**
 * Bench state (§1.2 seam).
 *
 * The authoritative list of apparatus the student has placed on the bench.
 * §1.1 (inventory) writes to it; the upcoming 3D sandbox will render from it.
 * Kept as a pure Zustand store with no React/rendering concerns.
 */
import { create } from "zustand";
import { getApparatus } from "@/data/apparatus";

export interface BenchItem {
  apparatusId: string;
  quantity: number;
  addedAt: number;
}

interface BenchState {
  items: BenchItem[];
  add: (apparatusId: string) => void;
  remove: (apparatusId: string) => void;
  setQuantity: (apparatusId: string, quantity: number) => void;
  clear: () => void;
}

const MAX_QUANTITY = 12;

export const useBench = create<BenchState>((set) => ({
  items: [],

  add: (apparatusId) =>
    set((state) => {
      if (!getApparatus(apparatusId)) return state;
      const existing = state.items.find((i) => i.apparatusId === apparatusId);
      if (existing) {
        if (existing.quantity >= MAX_QUANTITY) return state;
        return {
          items: state.items.map((i) =>
            i.apparatusId === apparatusId
              ? { ...i, quantity: i.quantity + 1 }
              : i,
          ),
        };
      }
      return {
        items: [
          ...state.items,
          { apparatusId, quantity: 1, addedAt: Date.now() },
        ],
      };
    }),

  remove: (apparatusId) =>
    set((state) => ({
      items: state.items.filter((i) => i.apparatusId !== apparatusId),
    })),

  setQuantity: (apparatusId, quantity) =>
    set((state) => {
      const clamped = Math.max(0, Math.min(MAX_QUANTITY, Math.round(quantity)));
      if (clamped === 0) {
        return { items: state.items.filter((i) => i.apparatusId !== apparatusId) };
      }
      return {
        items: state.items.map((i) =>
          i.apparatusId === apparatusId ? { ...i, quantity: clamped } : i,
        ),
      };
    }),

  clear: () => set({ items: [] }),
}));

/** Derived selectors (kept out of components for reuse + testability). */
export const selectTotalCount = (state: BenchState): number =>
  state.items.reduce((sum, i) => sum + i.quantity, 0);

export const selectQuantityFor =
  (apparatusId: string) =>
  (state: BenchState): number =>
    state.items.find((i) => i.apparatusId === apparatusId)?.quantity ?? 0;
