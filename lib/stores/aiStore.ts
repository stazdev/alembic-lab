/**
 * AI assistant settings — the user's own Gemini API key, chosen model, and a
 * master enable toggle. Persisted to localStorage ("alembic-ai"); the key never
 * leaves this browser except in direct calls to Google's Gemini API.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const DEFAULT_MODEL = "gemini-2.5-flash";

/** Model options for the Settings picker. Unknown ids just return an API error,
 *  so the list is safe to keep even as Google's lineup changes. */
export const AI_MODELS: { id: string; label: string; note: string }[] = [
  { id: "gemini-2.5-flash", label: "2.5 Flash", note: "Fast · free-tier friendly" },
  { id: "gemini-2.5-pro", label: "2.5 Pro", note: "Most capable 2.5" },
  { id: "gemini-2.5-flash-lite", label: "2.5 Flash-Lite", note: "Cheapest · fastest" },
  { id: "gemini-3.5-flash", label: "3 Flash", note: "Newest — if enabled on your key" },
];

interface AiState {
  apiKey: string;
  model: string;
  enabled: boolean;
  setApiKey: (key: string) => void;
  setModel: (model: string) => void;
  setEnabled: (value: boolean) => void;
  reset: () => void;
}

export const useAi = create<AiState>()(
  persist(
    (set) => ({
      apiKey: "",
      model: DEFAULT_MODEL,
      enabled: false,
      setApiKey: (apiKey) => set({ apiKey }),
      setModel: (model) => set({ model }),
      setEnabled: (enabled) => set({ enabled }),
      reset: () => set({ apiKey: "", model: DEFAULT_MODEL, enabled: false }),
    }),
    { name: "alembic-ai" },
  ),
);

/** AI features are available only when enabled AND a key is present. */
export const hasAi = (s: { enabled: boolean; apiKey: string }): boolean =>
  s.enabled && s.apiKey.trim().length > 0;
