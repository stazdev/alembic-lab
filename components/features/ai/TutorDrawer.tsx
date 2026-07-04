"use client";

/**
 * AI Chemistry Tutor — a streaming chat drawer. Aware of the current page via
 * pageContext; multi-turn kept in memory only (not persisted). Gated content:
 * with no key set it shows a "connect a key" prompt instead of the composer.
 */
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUp, Eraser, Sparkles, Square, X } from "lucide-react";
import { useAi, hasAi } from "@/lib/stores/aiStore";
import { usePrefs } from "@/lib/stores/prefsStore";
import { streamGenerate, GeminiError } from "@/lib/ai/gemini";
import { TUTOR_SYSTEM, pageContext, renderContext } from "@/lib/ai/context";
import { AiMarkdown } from "./AiMarkdown";
import { cn } from "@/lib/utils";

interface Msg {
  role: "user" | "model";
  text: string;
}

const SUGGESTIONS = [
  "Explain limiting reagents simply",
  "What makes a strong acid strong?",
  "How do I read a titration curve?",
];

export function TutorDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const apiKey = useAi((s) => s.apiKey);
  const model = useAi((s) => s.model);
  const ready = useAi(hasAi);
  const pathname = usePathname();
  const prefersReduced = useReducedMotion();
  const reduceMotionPref = usePrefs((s) => s.reduceMotion);
  const noMotion = Boolean(prefersReduced) || reduceMotionPref;

  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Escape closes; closing aborts any in-flight request.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) abortRef.current?.abort();
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || streaming || !ready) return;
    const history = [...messages, { role: "user", text: trimmed } as Msg];
    setMessages([...history, { role: "model", text: "" }]);
    setInput("");
    setError(null);
    setStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;
    const transcript = history
      .map((m) => `${m.role === "user" ? "Student" : "Tutor"}: ${m.text}`)
      .join("\n\n");

    try {
      let acc = "";
      for await (const delta of streamGenerate({
        apiKey,
        model,
        system: `${TUTOR_SYSTEM}\n\n${renderContext(pageContext(pathname))}\n\nContinue the conversation, replying as the tutor to the student's latest message.`,
        prompt: transcript,
        maxOutputTokens: 1500,
        signal: controller.signal,
      })) {
        acc += delta;
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "model", text: acc };
          return copy;
        });
      }
      if (!acc) {
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "model", text: "(no response)" };
          return copy;
        });
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") {
        // Keep whatever streamed so far.
      } else {
        setError(e instanceof GeminiError ? e.message : "Something went wrong.");
        // Drop the empty model bubble.
        setMessages((prev) => (prev[prev.length - 1]?.text === "" ? prev.slice(0, -1) : prev));
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }

  const stop = () => abortRef.current?.abort();
  const clear = () => {
    stop();
    setMessages([]);
    setError(null);
  };

  return (
    <AnimatePresence>
      {open && [
        <motion.div
          key="backdrop"
          className="fixed inset-0 z-40 bg-ink/25 backdrop-blur-[2px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: noMotion ? 0 : 0.2 }}
          onClick={onClose}
        />,
        <motion.aside
          key="panel"
          aria-label="AI chemistry tutor"
          className="fixed inset-4 z-50 flex flex-col overflow-hidden rounded-card border border-line bg-surface shadow-lift sm:left-auto sm:w-full sm:max-w-md"
          initial={noMotion ? { opacity: 0 } : { x: "100%" }}
          animate={noMotion ? { opacity: 1 } : { x: 0 }}
          exit={noMotion ? { opacity: 0 } : { x: "100%" }}
          transition={noMotion ? { duration: 0 } : { type: "spring", stiffness: 320, damping: 34 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 border-b border-line p-4">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-ctrl bg-ink text-on-dark">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-ink">Chemistry tutor</div>
                <div className="text-[11px] text-ink-2">AI-generated · powered by your Gemini key</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={clear}
                  aria-label="Clear conversation"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-pill border border-line bg-surface text-ink-2 transition hover:text-ink"
                >
                  <Eraser className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="inline-flex h-8 w-8 items-center justify-center rounded-pill border border-line bg-surface text-ink-2 transition hover:bg-surface-2 hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          {!ready ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
              <div className="grid h-12 w-12 place-items-center rounded-card bg-surface-2 text-ink-3">
                <Sparkles className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium text-ink">Connect a Gemini key</p>
              <p className="max-w-xs text-xs leading-relaxed text-ink-2">
                Add your own Google Gemini API key in Settings to chat with the
                tutor. Your key stays in this browser.
              </p>
              <Link
                href="/settings"
                onClick={onClose}
                className="mt-1 inline-flex items-center gap-1.5 rounded-pill bg-ink px-4 py-2 text-sm font-medium text-on-dark transition hover:bg-dark-2"
              >
                Open Settings
              </Link>
            </div>
          ) : (
            <>
              <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
                {messages.length === 0 && (
                  <div className="space-y-3">
                    <p className="text-sm text-ink-2">
                      Ask me anything about the chemistry you&rsquo;re working on. I
                      can see which page you&rsquo;re on for context.
                    </p>
                    <div className="flex flex-col gap-1.5">
                      {SUGGESTIONS.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => send(s)}
                          className="rounded-ctrl border border-line bg-surface-2 px-3 py-2 text-left text-xs text-ink transition hover:border-line-strong"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] rounded-card px-3.5 py-2.5 text-sm leading-relaxed",
                        m.role === "user"
                          ? "whitespace-pre-line bg-ink text-on-dark"
                          : "border border-line bg-surface-2 text-ink",
                      )}
                    >
                      {m.role === "user" ? (
                        m.text
                      ) : m.text ? (
                        <AiMarkdown text={m.text} />
                      ) : (
                        streaming && <span className="text-ink-3">…</span>
                      )}
                    </div>
                  </div>
                ))}
                {error && (
                  <div className="rounded-ctrl border border-line bg-surface-2 p-3 text-xs" style={{ color: "#c0492e" }}>
                    {error}
                  </div>
                )}
              </div>

              {/* Composer */}
              <div className="border-t border-line p-3">
                <div className="flex items-end gap-2 rounded-card border border-line bg-surface px-3 py-2 focus-within:border-ink-2">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        send(input);
                      }
                    }}
                    rows={1}
                    placeholder="Ask the tutor…"
                    aria-label="Message the tutor"
                    className="max-h-32 min-h-[24px] flex-1 resize-none bg-transparent text-sm text-ink placeholder:text-ink-3 focus:outline-none"
                  />
                  {streaming ? (
                    <button
                      type="button"
                      onClick={stop}
                      aria-label="Stop"
                      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-pill bg-surface-2 text-ink transition hover:bg-line/60"
                    >
                      <Square className="h-3.5 w-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => send(input)}
                      disabled={!input.trim()}
                      aria-label="Send"
                      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-pill bg-ink text-on-dark transition hover:bg-dark-2 disabled:opacity-40"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <p className="mt-1.5 px-1 text-[10px] leading-tight text-ink-3">
                  AI can be imperfect. The graded values in Alembic are computed
                  by its engines, not the AI.
                </p>
              </div>
            </>
          )}
        </motion.aside>,
      ]}
    </AnimatePresence>
  );
}
