import { describe, it, expect, vi, afterEach } from "vitest";
import { generate, streamGenerate, validateKey, GeminiError } from "@/lib/ai/gemini";

function jsonResponse(status: number, obj: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    body: null,
    json: async () => obj,
  } as unknown as Response;
}

function sseResponse(chunks: string[]): Response {
  const enc = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    start(c) {
      for (const ch of chunks) c.enqueue(enc.encode(ch));
      c.close();
    },
  });
  return { ok: true, status: 200, body: stream, json: async () => ({}) } as unknown as Response;
}

const textPayload = (t: string) => ({
  candidates: [{ content: { parts: [{ text: t }] } }],
});

afterEach(() => vi.unstubAllGlobals());

describe("gemini client — generate", () => {
  it("extracts candidates[0].content.parts[].text", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse(200, textPayload("Hello world"))));
    const out = await generate({ apiKey: "k", model: "gemini-2.5-flash", prompt: "hi" });
    expect(out).toBe("Hello world");
  });

  it("sends the key in the x-goog-api-key header, not the URL", async () => {
    const fetchMock = vi.fn(
      async (_url: string, _init: RequestInit) => jsonResponse(200, textPayload("ok")),
    );
    vi.stubGlobal("fetch", fetchMock);
    await generate({ apiKey: "SECRET", model: "gemini-2.5-flash", prompt: "hi", system: "be nice" });
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).not.toContain("SECRET");
    expect(init.headers).toMatchObject({ "x-goog-api-key": "SECRET" });
    // system instruction is included when provided
    expect(String(init.body)).toContain("systemInstruction");
  });

  it("disables thinking for Flash models (so it can't eat the token budget) but not Pro", async () => {
    const fetchMock = vi.fn(
      async (_url: string, _init: RequestInit) => jsonResponse(200, textPayload("ok")),
    );
    vi.stubGlobal("fetch", fetchMock);
    await generate({ apiKey: "k", model: "gemini-2.5-flash", prompt: "hi" });
    await generate({ apiKey: "k", model: "gemini-2.5-pro", prompt: "hi" });
    const flashBody = String(fetchMock.mock.calls[0][1].body);
    const proBody = String(fetchMock.mock.calls[1][1].body);
    expect(flashBody).toContain("thinkingBudget");
    expect(proBody).not.toContain("thinkingBudget");
  });

  it("maps 403 to a friendly auth error", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse(403, { error: { message: "bad key" } })));
    await expect(generate({ apiKey: "k", model: "m", prompt: "hi" })).rejects.toMatchObject({
      kind: "auth",
    });
  });

  it("maps 429 to a rate-limit error", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse(429, {})));
    await expect(generate({ apiKey: "k", model: "m", prompt: "hi" })).rejects.toMatchObject({
      kind: "rate",
    });
  });

  it("throws a safety error when the response is blocked", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse(200, { candidates: [{ finishReason: "SAFETY" }] })),
    );
    await expect(generate({ apiKey: "k", model: "m", prompt: "hi" })).rejects.toBeInstanceOf(
      GeminiError,
    );
  });
});

describe("gemini client — streamGenerate", () => {
  it("yields text deltas from SSE data lines", async () => {
    const chunks = [
      `data: ${JSON.stringify(textPayload("Hel"))}\n\n`,
      `data: ${JSON.stringify(textPayload("lo"))}\n\n`,
      `data: [DONE]\n\n`,
    ];
    vi.stubGlobal("fetch", vi.fn(async () => sseResponse(chunks)));
    const out: string[] = [];
    for await (const d of streamGenerate({ apiKey: "k", model: "m", prompt: "hi" })) out.push(d);
    expect(out.join("")).toBe("Hello");
  });

  it("tolerates data split across chunk boundaries", async () => {
    const full = `data: ${JSON.stringify(textPayload("Split"))}\n\n`;
    const mid = Math.floor(full.length / 2);
    vi.stubGlobal("fetch", vi.fn(async () => sseResponse([full.slice(0, mid), full.slice(mid)])));
    const out: string[] = [];
    for await (const d of streamGenerate({ apiKey: "k", model: "m", prompt: "hi" })) out.push(d);
    expect(out.join("")).toBe("Split");
  });
});

describe("gemini client — validateKey", () => {
  it("ok on a 200", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse(200, textPayload("pong"))));
    expect(await validateKey("k", "gemini-2.5-flash")).toEqual({ ok: true });
  });
  it("returns the error message on a bad key", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse(403, {})));
    const r = await validateKey("bad", "gemini-2.5-flash");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/rejected/i);
  });
});
