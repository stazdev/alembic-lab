"use client";

/**
 * Reusable one-shot AI action: a button that streams a response into an
 * expandable panel under an "AI-generated" badge. Self-gating — renders nothing
 * unless the user has connected a Gemini key. Used for "Explain this" and
 * "Ask for a hint".
 */
import { useRef, useState, type ReactNode } from "react";
import { Sparkles, Square } from "lucide-react";
import { useAi, hasAi } from "@/lib/stores/aiStore";
import { useMounted } from "@/lib/hooks/useMounted";
import { streamGenerate, GeminiError } from "@/lib/ai/gemini";
import { AiMarkdown } from "./AiMarkdown";

export function AiActionButton({
  label,
  system,
  prompt,
  icon,
  maxOutputTokens = 1024,
  className,
}: {
  label: string;
  system: string;
  prompt: string;
  icon?: ReactNode;
  maxOutputTokens?: number;
  className?: string;
}) {
  const apiKey = useAi((s) => s.apiKey);
  const model = useAi((s) => s.model);
  const ready = useAi(hasAi);
  const mounted = useMounted();

  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Gate on mount so SSR and the first client render agree before the persisted
  // key store hydrates (avoids a hydration mismatch).
  if (!mounted || !ready) return null;

  async function run() {
    setOpen(true);
    setText("");
    setError(null);
    setStreaming(true);
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      let acc = "";
      for await (const delta of streamGenerate({
        apiKey,
        model,
        system,
        prompt,
        maxOutputTokens,
        signal: controller.signal,
      })) {
        acc += delta;
        setText(acc);
      }
      if (!acc) setText("(no response)");
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") {
        // keep partial text
      } else {
        setError(e instanceof GeminiError ? e.message : "Something went wrong.");
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={run}
        disabled={streaming}
        className="inline-flex items-center gap-1.5 rounded-pill border border-line bg-surface-2 px-3.5 py-1.5 text-xs font-medium text-ink transition hover:bg-line/60 disabled:opacity-60"
      >
        {icon ?? <Sparkles className="h-3.5 w-3.5" />}
        {streaming ? "Thinking…" : label}
      </button>

      {open && (
        <div className="mt-3 rounded-ctrl border border-line bg-surface-2 p-3">
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1 rounded-pill bg-accent-soft px-2 py-0.5 text-[10px] font-semibold text-accent-ink">
              <Sparkles className="h-3 w-3" /> AI-generated
            </span>
            {streaming && (
              <button
                type="button"
                onClick={() => abortRef.current?.abort()}
                aria-label="Stop"
                className="inline-flex h-6 w-6 items-center justify-center rounded-pill bg-surface text-ink-2 transition hover:text-ink"
              >
                <Square className="h-3 w-3" />
              </button>
            )}
          </div>
          {error ? (
            <p className="text-xs" style={{ color: "#c0492e" }}>
              {error}
            </p>
          ) : text ? (
            <AiMarkdown text={text} />
          ) : (
            <p className="text-sm text-ink-3">…</p>
          )}
          <p className="mt-2 text-[10px] leading-tight text-ink-3">
            May be imperfect — the values above are computed by Alembic&rsquo;s
            engines, not the AI.
          </p>
        </div>
      )}
    </div>
  );
}
