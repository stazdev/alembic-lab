/**
 * Local user preferences — persisted to localStorage (this browser only).
 * Shared by Settings and Profile.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PrefsState {
  displayName: string;
  reduceMotion: boolean;
  setDisplayName: (name: string) => void;
  setReduceMotion: (value: boolean) => void;
}

export const usePrefs = create<PrefsState>()(
  persist(
    (set) => ({
      displayName: "",
      reduceMotion: false,
      setDisplayName: (displayName) => set({ displayName }),
      setReduceMotion: (reduceMotion) => set({ reduceMotion }),
    }),
    { name: "alembic-prefs" },
  ),
);
