"use client";

/**
 * AI overview for the selected element — grounded in its known data (category,
 * group/period/block, and measured/predicted properties). Lazy, session-cached
 * per element, self-gated on a connected key. Labelled AI-generated.
 */
import { useEffect, useRef, useState } from "react";
import { Sparkles, Square } from "lucide-react";
import { useAi, hasAi } from "@/lib/stores/aiStore";
import { useMounted } from "@/lib/hooks/useMounted";
import { streamGenerate, GeminiError } from "@/lib/ai/gemini";
import { TUTOR_SYSTEM } from "@/lib/ai/context";
import { AiMarkdown } from "@/components/features/ai/AiMarkdown";
import type { ElementDatum } from "@/data/elements";

const cache = new Map<number, string>();

export function ElementInsights({ element }: { element: ElementDatum }) {
  const apiKey = useAi((s) => s.apiKey);
  const model = useAi((s) => s.model);
  const ready = useAi(hasAi);
  const mounted = useMounted();

  const [text, setText] = useState<string>(() => cache.get(element.z) ?? "");
  const [started, setStarted] = useState<boolean>(() => cache.has(element.z));
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  if (!mounted || !ready) return null;

  const predicted = element.category === "unknown";

  async function generate() {
    setStarted(true);
    setText("");
    setError(null);
    setStreaming(true);
    const controller = new AbortController();
    abortRef.current = controller;

    const props: string[] = [];
    if (element.standardState !== "unknown") props.push(`state ${element.standardState}`);
    if (element.electronegativity != null) props.push(`electronegativity ${element.electronegativity}`);
    if (element.meltingPoint != null) props.push(`mp ${element.meltingPoint} K`);
    if (element.boilingPoint != null) props.push(`bp ${element.boilingPoint} K`);
    if (element.density != null) props.push(`density ${element.density} g/cm³`);

    const prompt = `Give a short, engaging overview of the element ${element.name} (${element.symbol}, atomic number ${element.z}) for a chemistry student.

Known data (from Alembic — ground truth): ${element.category.replace(/-/g, " ")}, group ${element.group}, period ${element.period}, ${element.block}-block, atomic mass ${element.mass.toFixed(2)}${props.length ? `, ${props.join(", ")}` : ""}.${predicted ? " NOTE: this is a synthetic superheavy element; most of its properties are PREDICTED, not measured — mention that." : ""}

Cover, each on its own short line: what it is and where it sits in the table; how it's found or made; notable uses or reactions; and one interesting fact. Be concise.`;

    try {
      let acc = "";
      for await (const delta of streamGenerate({
        apiKey,
        model,
        system: TUTOR_SYSTEM,
        prompt,
        maxOutputTokens: 900,
        signal: controller.signal,
      })) {
        acc += delta;
        setText(acc);
      }
      if (acc) cache.set(element.z, acc);
      else setText("(no response)");
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") {
        // keep partial
      } else {
        setError(e instanceof GeminiError ? e.message : "Something went wrong.");
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }

  return (
    <div className="rounded-card border border-line bg-surface-2 p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-ink">AI insights</h3>
        <span className="inline-flex items-center gap-1 rounded-pill bg-accent-soft px-2 py-0.5 text-[10px] font-semibold text-accent-ink">
          <Sparkles className="h-3 w-3" /> AI-generated
        </span>
      </div>

      {!started ? (
        <div className="mt-2">
          <p className="text-xs leading-relaxed text-ink-2">
            An AI overview of {element.name} — what it is, how it&rsquo;s made or
            found, uses, and a fun fact.
          </p>
          <button
            type="button"
            onClick={generate}
            className="mt-2 inline-flex items-center gap-1.5 rounded-pill border border-line bg-surface px-3.5 py-1.5 text-xs font-medium text-ink transition hover:bg-surface-2"
          >
            <Sparkles className="h-3.5 w-3.5" /> Generate insights
          </button>
        </div>
      ) : (
        <div className="mt-2">
          {streaming && (
            <button
              type="button"
              onClick={() => abortRef.current?.abort()}
              aria-label="Stop"
              className="float-right inline-flex h-6 w-6 items-center justify-center rounded-pill bg-surface text-ink-2 transition hover:text-ink"
            >
              <Square className="h-3 w-3" />
            </button>
          )}
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
            AI-generated overview — the data above is from Alembic&rsquo;s tables.
          </p>
        </div>
      )}
    </div>
  );
}
