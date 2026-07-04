"use client";

/**
 * AI compound summary for the Molecules page — grounded in the computed
 * openchemlib estimates. Lazy (only calls on demand), cached per compound for
 * the session, and clearly labelled as general educational info, not an SDS.
 * Self-gates on a connected key behind a useMounted guard.
 */
import { useEffect, useRef, useState } from "react";
import { Sparkles, Square } from "lucide-react";
import { useAi, hasAi } from "@/lib/stores/aiStore";
import { useMounted } from "@/lib/hooks/useMounted";
import { streamGenerate, GeminiError } from "@/lib/ai/gemini";
import { TUTOR_SYSTEM } from "@/lib/ai/context";
import { predictProperties } from "@/lib/chem/openchemlib";
import { AiMarkdown } from "./AiMarkdown";

// Session cache so re-selecting a compound doesn't re-call the API.
const cache = new Map<string, string>();

export function MoleculeInsights({
  name,
  formula,
  smiles,
}: {
  name: string;
  formula?: string;
  smiles?: string;
}) {
  const apiKey = useAi((s) => s.apiKey);
  const model = useAi((s) => s.model);
  const ready = useAi(hasAi);
  const mounted = useMounted();

  const cacheKey = `${name}|${smiles ?? ""}`;
  const [text, setText] = useState<string>(() => cache.get(cacheKey) ?? "");
  const [started, setStarted] = useState<boolean>(() => cache.has(cacheKey));
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Abort any in-flight request on unmount.
  useEffect(() => () => abortRef.current?.abort(), []);

  if (!mounted || !ready) return null;

  async function generate() {
    setStarted(true);
    setText("");
    setError(null);
    setStreaming(true);
    const controller = new AbortController();
    abortRef.current = controller;

    let facts = `Name: ${name}`;
    if (formula) facts += `\nFormula: ${formula}`;
    if (smiles) facts += `\nSMILES: ${smiles}`;
    if (smiles) {
      try {
        const p = await predictProperties(smiles);
        if (p) {
          facts += `\nEstimated properties: logP ${p.logP.toFixed(2)}, aqueous solubility logS ${p.logS.toFixed(
            2,
          )}, TPSA ${p.tpsa.toFixed(0)} Å², H-bond donors ${p.hbd}, acceptors ${p.hba}`;
        }
      } catch {
        /* estimates are optional grounding */
      }
    }

    const prompt = `Give a short, structured overview of this compound for a chemistry student.\n\n${facts}\n\nCover each of these on its own short line: what it is; common uses; notable structural features; and general safety/handling notes. This is general educational information, NOT a safety data sheet. Be concise.`;

    try {
      let acc = "";
      for await (const delta of streamGenerate({
        apiKey,
        model,
        system: TUTOR_SYSTEM,
        prompt,
        maxOutputTokens: 400,
        signal: controller.signal,
      })) {
        acc += delta;
        setText(acc);
      }
      if (acc) cache.set(cacheKey, acc);
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
    <div className="rounded-card border border-line bg-surface p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-ink">AI insights</h3>
        <span className="inline-flex items-center gap-1 rounded-pill bg-accent-soft px-2 py-0.5 text-[10px] font-semibold text-accent-ink">
          <Sparkles className="h-3 w-3" /> AI-generated
        </span>
      </div>

      {!started ? (
        <div className="mt-2">
          <p className="text-xs leading-relaxed text-ink-2">
            An AI overview of {name} — what it is, uses, structure, and general
            safety notes.
          </p>
          <button
            type="button"
            onClick={generate}
            className="mt-2 inline-flex items-center gap-1.5 rounded-pill border border-line bg-surface-2 px-3.5 py-1.5 text-xs font-medium text-ink transition hover:bg-line/60"
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
              className="float-right inline-flex h-6 w-6 items-center justify-center rounded-pill bg-surface-2 text-ink-2 transition hover:text-ink"
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
            General educational info, AI-generated — not a safety data sheet.
            Verify before any real-world use.
          </p>
        </div>
      )}
    </div>
  );
}
