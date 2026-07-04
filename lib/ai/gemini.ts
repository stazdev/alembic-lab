/**
 * Minimal Gemini REST client — no SDK, pure fetch, browser-friendly. Calls go
 * directly to Google with the user's own key in the x-goog-api-key header (never
 * in the URL). UI-agnostic and unit-testable with a mocked fetch.
 *
 * Verified endpoints (v1beta):
 *   POST …/models/{model}:generateContent
 *   POST …/models/{model}:streamGenerateContent?alt=sse
 */

const BASE = "https://generativelanguage.googleapis.com/v1beta/models";

export type GeminiErrorKind = "auth" | "rate" | "safety" | "network" | "request";

export class GeminiError extends Error {
  kind: GeminiErrorKind;
  constructor(message: string, kind: GeminiErrorKind) {
    super(message);
    this.name = "GeminiError";
    this.kind = kind;
  }
}

export interface GenInput {
  apiKey: string;
  model: string;
  prompt: string;
  system?: string;
  temperature?: number;
  maxOutputTokens?: number;
  signal?: AbortSignal;
}

function body(input: GenInput) {
  // Gemini 2.5/3 "thinking" consumes maxOutputTokens, which truncates or empties
  // the visible answer. These are short explanatory tasks that don't need it, so
  // disable it for Flash models (thinkingBudget 0). Pro can't disable thinking,
  // so we rely on the generous token cap there instead.
  const disableThinking = /flash/i.test(input.model);
  return JSON.stringify({
    contents: [{ role: "user", parts: [{ text: input.prompt }] }],
    ...(input.system ? { systemInstruction: { parts: [{ text: input.system }] } } : {}),
    generationConfig: {
      temperature: input.temperature ?? 0.4,
      maxOutputTokens: input.maxOutputTokens ?? 1024,
      ...(disableThinking ? { thinkingConfig: { thinkingBudget: 0 } } : {}),
    },
  });
}

async function call(method: string, input: GenInput): Promise<Response> {
  try {
    return await fetch(`${BASE}/${input.model}:${method}`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": input.apiKey },
      body: body(input),
      signal: input.signal,
    });
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") throw e;
    throw new GeminiError("Couldn't reach Gemini. Check your connection.", "network");
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function friendly(status: number, payload: any): GeminiError {
  if (status === 400 || status === 401 || status === 403)
    return new GeminiError("That key was rejected. Check it in Google AI Studio.", "auth");
  if (status === 429)
    return new GeminiError("Rate limit or quota reached — wait a moment and try again.", "rate");
  if (status >= 500)
    return new GeminiError("Gemini is having trouble right now. Try again shortly.", "request");
  const msg = payload?.error?.message;
  return new GeminiError(typeof msg === "string" ? msg : `Request failed (${status}).`, "request");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function errorFor(res: Response): Promise<GeminiError> {
  let payload: unknown = null;
  try {
    payload = await res.json();
  } catch {
    /* ignore */
  }
  return friendly(res.status, payload);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function textOf(json: any): string {
  const parts = json?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return "";
  return parts.map((p: { text?: string }) => p.text ?? "").join("");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function blocked(json: any): boolean {
  return (
    json?.candidates?.[0]?.finishReason === "SAFETY" ||
    Boolean(json?.promptFeedback?.blockReason)
  );
}

/** One-shot generation. Returns the full text. */
export async function generate(input: GenInput): Promise<string> {
  const res = await call("generateContent", input);
  if (!res.ok) throw await errorFor(res);
  const json = await res.json();
  if (blocked(json)) throw new GeminiError("The model declined to answer that.", "safety");
  return textOf(json);
}

/** Streaming generation — yields text deltas as they arrive (SSE). */
export async function* streamGenerate(input: GenInput): AsyncGenerator<string> {
  const res = await call("streamGenerateContent?alt=sse", input);
  if (!res.ok || !res.body) throw await errorFor(res);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      let json: unknown;
      try {
        json = JSON.parse(payload);
      } catch {
        continue;
      }
      if (blocked(json)) throw new GeminiError("The model declined to answer that.", "safety");
      const text = textOf(json);
      if (text) yield text;
    }
  }
}

/** Cheap key/model check for the Settings "Test" button. */
export async function validateKey(
  apiKey: string,
  model: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await generate({ apiKey, model, prompt: "ping", maxOutputTokens: 4, temperature: 0 });
    return { ok: true };
  } catch (e) {
    if (e instanceof GeminiError) return { ok: false, error: e.message };
    return { ok: false, error: "Couldn't reach Gemini." };
  }
}
