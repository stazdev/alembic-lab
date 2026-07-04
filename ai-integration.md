# AI Integration — Bring-Your-Own Gemini Key

> Add optional AI features powered by the **user's own Gemini API key**, entered in Settings and stored
> only in their browser. Calls go **directly from the browser to Google's Gemini REST API** — there is
> no Alembic server, so this keeps the project's no-backend architecture intact.
>
> **Hard rule:** AI never computes graded answers or overrides the deterministic chemistry engines. It
> explains, coaches, and summarises — always visibly labelled as AI-generated, always grounded in the
> values the engines already computed.

Status: **spec / not yet built.** Scope agreed with the user: all four features + a model dropdown.

---

## Table of Contents

1. [Architecture & the no-backend fit](#1-architecture--the-no-backend-fit)
2. [Verified Gemini API facts (checked 2026-07-04)](#2-verified-gemini-api-facts)
3. [Key & model storage (aiStore)](#3-key--model-storage)
4. [The Gemini client (`lib/ai/gemini.ts`)](#4-the-gemini-client)
5. [Prompt context builder](#5-prompt-context-builder)
6. [Guardrails (non-negotiable)](#6-guardrails)
7. [Settings UI](#7-settings-ui)
8. [Feature 1 — AI Chemistry Tutor (chat)](#8-feature-1--ai-chemistry-tutor)
9. [Feature 2 — Explain-this (Sandbox & Tasks)](#9-feature-2--explain-this)
10. [Feature 3 — AI hints in Practice mode](#10-feature-3--ai-hints-in-practice)
11. [Feature 4 — Molecule insights](#11-feature-4--molecule-insights)
12. [Availability & graceful degradation](#12-availability--graceful-degradation)
13. [Security & privacy](#13-security--privacy)
14. [Cost, rate limits & UX](#14-cost-rate-limits--ux)
15. [File manifest](#15-file-manifest)
16. [Phased build plan](#16-phased-build-plan)
17. [Risks & mitigations](#17-risks--mitigations)
18. [Sources](#18-sources)

---

## 1. Architecture & the no-backend fit

```
Browser (Alembic, static/serverless)
  Settings ── user pastes their own Gemini key ──► aiStore (localStorage "alembic-ai")
                                                        │
  Feature (tutor / explain / hint / insights) ─────────┤
       builds { system, prompt, context } ─────────────┤
                                                        ▼
                                   lib/ai/gemini.ts  (fetch, streaming SSE)
                                                        │  x-goog-api-key: <user key>
                                                        ▼
                    https://generativelanguage.googleapis.com/v1beta/... (Google)
```

- **No dependency.** We call the REST endpoint with `fetch` — no `@google/genai` SDK to bundle or keep
  in sync. Smaller, fully client-side, and future-proof against SDK churn.
- **The key is the user's.** Entered by them, held in their browser only, sent only to Google. This is
  the accepted pattern for a client-only app (unlike embedding a shared app key, which is unsafe).
- **Everything is optional.** With no key set, the AI affordances are hidden or show a "connect a key"
  prompt; the rest of the app is unchanged.

---

## 2. Verified Gemini API facts

Confirmed against the official docs on 2026-07-04 (see [Sources](#18-sources)).

**SDK vs REST.** Current SDK is `@google/genai` (`new GoogleGenAI({ apiKey })` →
`ai.models.generateContent(...)`), and browser init is identical to server. We use **REST directly**.

**Endpoints (v1beta):**
```
POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent
POST https://generativelanguage.googleapis.com/v1beta/models/{model}:streamGenerateContent?alt=sse
```

**Auth:** the key may be passed as `?key=` or the `x-goog-api-key` header. **We use the header** so the
key never appears in a URL/referrer/log.

**Request body:**
```json
{
  "contents": [{ "role": "user", "parts": [{ "text": "…" }] }],
  "systemInstruction": { "parts": [{ "text": "…" }] },
  "generationConfig": { "temperature": 0.4, "maxOutputTokens": 800 }
}
```

**Response:** generated text at `candidates[0].content.parts[0].text`; token counts in `usageMetadata`;
safety info in `promptFeedback` / `candidates[].finishReason`.

**Streaming:** `:streamGenerateContent?alt=sse` returns Server-Sent Events; each `data: {…}` line is a
partial with the same shape — concatenate `candidates[0].content.parts[0].text` across chunks.

**Key format.** The new **auth keys** begin `AQ.` (project-scoped) — the format the user has, and the
one Google is migrating everyone to (unrestricted *standard* keys get rejected in stages: 2026-06-19
and 2026-09). Both formats still work today with the same header.

**Model IDs** (for the dropdown; default first):

| UI label | model id | Notes |
|---|---|---|
| Gemini 2.5 Flash (default) | `gemini-2.5-flash` | Best price/performance, low-latency, free-tier-friendly |
| Gemini 2.5 Pro | `gemini-2.5-pro` | Most capable 2.5; slower/costlier |
| Gemini 2.5 Flash-Lite | `gemini-2.5-flash-lite` | Cheapest/fastest |
| Gemini 3 Flash | `gemini-3.5-flash` | Newest; listed in docs — offered but **verify availability on the user's key** |

The client sends whatever id is stored; an unknown model just returns a clear API error, so the dropdown
is safe even as Google's lineup changes.

---

## 3. Key & model storage

`lib/stores/aiStore.ts` — Zustand + `persist`, key `alembic-ai`:

```ts
interface AiState {
  apiKey: string;        // the user's Gemini key (this browser only)
  model: string;         // default "gemini-2.5-flash"
  enabled: boolean;      // master toggle
  setApiKey(k: string): void;
  setModel(m: string): void;
  setEnabled(v: boolean): void;
  reset(): void;         // called by Settings "Clear all local data"
}
export const hasAi = (s: AiState) => s.enabled && s.apiKey.trim().length > 0;
```

Reads happen behind the `useMounted()` guard (persisted state, same hydration rule as the rest of the
app). `reset()` is wired into Settings' existing "Clear all local data".

---

## 4. The Gemini client

`lib/ai/gemini.ts` — pure fetch, no dependency. Two entry points plus a validator:

```ts
export interface GenInput {
  apiKey: string;
  model: string;
  system: string;            // system instruction
  prompt: string;            // the user/task text
  temperature?: number;      // default 0.4
  maxOutputTokens?: number;  // default 800
  signal?: AbortSignal;      // abort on navigation / new request
}

// One-shot.
export async function generate(input: GenInput): Promise<string>;

// Streaming — async generator yielding text deltas.
export async function* streamGenerate(input: GenInput): AsyncGenerator<string>;

// Cheap key check for the Settings "Test" button (tiny maxOutputTokens).
export async function validateKey(apiKey: string, model: string): Promise<
  { ok: true } | { ok: false; error: string }
>;
```

**Error mapping** (surface friendly messages, never raw dumps):
- `400/403` invalid/disabled key → "That key was rejected — check it in AI Studio."
- `429` → "Rate limit reached — wait a moment or check your quota."
- `finishReason: SAFETY` / blocked → "The model declined to answer that."
- network/abort → quiet no-op on abort; "Couldn't reach Gemini" otherwise.

The client is UI-agnostic (no React), unit-testable with a mocked `fetch`.

---

## 5. Prompt context builder

`lib/ai/context.ts` grounds every prompt in what the app already knows, so the AI explains real
computed values instead of inventing them.

```ts
export interface AiContext {
  page: string;                       // e.g. "Sandbox", "Practice", "Molecules"
  facts: { label: string; value: string }[];  // computed values to ground on
  note?: string;                      // extra instruction for this surface
}
```

Each feature fills `facts` from the deterministic layer:
- **Sandbox:** current vessel species, pH, temperature, observables, balanced equations (from `resolveMixture`).
- **Tasks / Practice:** the prompt, the given values, the topic, and — for "explain" — the computed answer + worked solution (never for "hint").
- **Molecules:** name, formula, SMILES, and the `PropertyCard` estimates (logP, logS, TPSA…).

The builder renders `facts` into the prompt as a "Known values (already computed by the app — treat as
ground truth):" block.

---

## 6. Guardrails

Baked into every system instruction and enforced by what context we pass:

1. **Never the source of truth for numbers.** The computed values are supplied in context and declared
   authoritative; the model must use them, not recompute or contradict them. If asked to compute
   something the app already did, it defers to the provided value.
2. **Hints must not reveal answers.** The Practice "hint" path deliberately **omits** the answer and
   solution from context and instructs: "Give one nudge toward the method. Do NOT state the final
   numeric/letter answer."
3. **Always labelled.** Every AI output sits under an "AI-generated" badge with a one-line disclaimer
   ("May be imperfect — the graded values above are computed, not AI").
4. **Chemistry-scoped, safe.** System prompt frames it as a chemistry tutor for students; it declines
   unsafe requests (e.g. real-world synthesis of hazardous/illicit materials) and keeps a teaching tone.
5. **No secrets in prompts.** Never include the API key or unrelated user data in prompt text.

---

## 7. Settings UI

New "AI assistant" section in `SettingsView` (matches the existing card/`Row`/`Switch` style):

- **Enable toggle** (`Switch`) — master on/off.
- **API key** — a masked input (show/hide eye), placeholder "Paste your Gemini API key", with a
  **"Test"** button calling `validateKey` (green check / red error inline).
- **Model** — a custom `Select`/dropdown (default Gemini 2.5 Flash) per §2.
- **"Get a key"** link → https://aistudio.google.com/apikey.
- **Disclosure** (small print): "Your key is stored only in this browser and sent directly to Google
  when you use an AI feature — never to Alembic (there is no server). Remove it any time; don't use a
  shared computer." Plus a **"Remove key"** button.
- "Clear all local data" also clears the key (via `aiStore.reset`).

---

## 8. Feature 1 — AI Chemistry Tutor

**What:** an app-wide chat assistant. **Where:** a right-side **drawer** opened by a new TopBar
button (sparkle icon), mirroring `NotificationsDrawer` (backdrop, `AnimatePresence`, Esc-to-close).

- Multi-turn chat; **streams** responses via `streamGenerate`.
- Auto-attaches the current page's `AiContext` to the first turn (e.g. "the student is on the Sandbox
  with 0.1 M HCl + NaOH, pH 7.0") so answers are situated.
- System prompt: patient chemistry/biochem tutor for secondary–undergrad students; concise, uses the
  provided computed values; renders formulae in words or simple notation.
- Composer with send, stop (abort), and clear-conversation. Conversation is in-memory only (not
  persisted) to keep it simple and private.
- Empty state when no key: a short "Connect your Gemini key in Settings to chat with the tutor" card
  with a link.

Files: `components/features/ai/TutorDrawer.tsx`, `TutorMessage.tsx`; TopBar button gated on `hasAi`.

## 9. Feature 2 — Explain-this

**What:** an **"Explain"** button that turns a computed result into a plain-language walkthrough.

- **Sandbox:** on the Observation log / a vessel, "Explain what happened" → context = species, balanced
  equation(s), pH, ΔT, precipitate/gas flags → AI narrates the chemistry and why.
- **Tasks & Practice:** next to "Show solution", an "Explain this solution" → context = prompt, given,
  the computed answer, and the worked solution → AI expands the reasoning step by step.
- Reusable `components/features/ai/ExplainButton.tsx`: streams into an expandable panel under an
  "AI-generated" badge. Shown only when `hasAi`.

## 10. Feature 3 — AI hints in Practice

**What:** on a generated question, a **"Ask the tutor for a hint"** button beneath the existing staged
hints.

- Context = the question prompt + given values + topic, **excluding** the answer/solution.
- System prompt hard-instructs: one method-level nudge, no final answer, Socratic tone.
- Streams a short hint into the hints area, tagged "AI hint". Rate-limited to a sensible number per
  question to control cost. Shown only when `hasAi`.
- Layers on top of — does not replace — the deterministic staged hints.

## 11. Feature 4 — Molecule insights

**What:** on the Molecules page, an **"AI insights"** card beside the 2D/3D viewer and the computed
`PropertyCard`.

- Context = name, formula, SMILES, and the openchemlib estimates (logP, logS, TPSA, H-bond counts,
  Lipinski).
- AI produces a short, structured summary: what it is, common uses, notable structural features, and
  general safety/handling notes — explicitly **general educational info, AI-generated**, not a safety
  data sheet.
- `components/features/ai/MoleculeInsights.tsx`, lazy (only fetches when expanded), cached per compound
  for the session. Shown only when `hasAi`.

---

## 12. Availability & graceful degradation

- A single selector `hasAi(state)` gates every AI affordance. No key → affordances hidden or replaced
  by a one-line "connect a key" prompt linking to Settings.
- No feature is on a critical path: the sandbox, tasks, practice, and molecules all work fully without AI.
- Errors are contained to the AI panel (never crash the page); aborts on navigation.

## 13. Security & privacy

- Key lives in `localStorage` under `alembic-ai`, entered and removable by the user; masked in the UI.
- Sent only to `generativelanguage.googleapis.com` via header, over HTTPS, never in a URL.
- No analytics/telemetry on prompts; tutor chat is in-memory only.
- Clear disclosure in Settings; "Remove key" and "Clear all data" both wipe it.
- We reiterate in-app: treat the key like a password; don't use on shared machines.

## 14. Cost, rate limits & UX

- Default `gemini-2.5-flash` (free-tier-friendly), `temperature 0.4`, `maxOutputTokens` capped per
  feature (hints ~150, explanations ~500, tutor ~800, insights ~400).
- Streaming for perceived speed; a Stop button aborts in-flight requests; navigation cancels via
  `AbortController`.
- Friendly 429/quota messaging. Insights/explanations cache per subject for the session to avoid
  repeat calls.

## 15. File manifest

```
lib/stores/aiStore.ts                         # key/model/enabled, persisted "alembic-ai"
lib/ai/gemini.ts                              # fetch client: generate, streamGenerate, validateKey
lib/ai/context.ts                             # AiContext + per-surface builders
components/features/ai/TutorDrawer.tsx        # Feature 1 (+ TutorMessage.tsx, composer)
components/features/ai/ExplainButton.tsx      # Feature 2 (reused in sandbox + tasks/practice)
components/features/ai/MoleculeInsights.tsx   # Feature 4
components/features/settings/SettingsView.tsx # + "AI assistant" section (edit)
components/shell/TopBar.tsx                    # + tutor button gated on hasAi (edit)
tests/ai/gemini.test.ts                       # client parsing/errors with mocked fetch
```

## 16. Phased build plan

| Phase | Scope | Outcome | Status |
|---|---|---|---|
| **AI-0 — Foundation** | `aiStore`, `lib/ai/gemini.ts` (+ tests with mocked fetch), Settings "AI assistant" section with key + model + Test | Users can add/validate a key; nothing calls it yet | ✅ shipped |
| **AI-1 — Tutor** | `TutorDrawer` + TopBar button + page context | The flagship chat assistant works end-to-end | ✅ shipped |
| **AI-2 — Explain & Hints** | `AiActionButton` in Sandbox + Tasks/Practice; "Ask the tutor" hint in Practice | Contextual explanations and Socratic hints | ✅ shipped |
| **AI-3 — Molecule insights** | `MoleculeInsights` card on Molecules | AI compound summaries beside computed properties | ✅ shipped |
| **Polish** | walkthrough steps for the tutor, reduced-motion, error/empty states, caching | Consistent with the rest of the app | ✅ shipped — dashboard tour introduces the tutor (data-tour on the TopBar button); TutorDrawer honours reduced-motion (prefers-reduced-motion + the app pref); error/empty states + session caching done |

**Shipped notes.** The reusable component landed as `AiActionButton` (not `ExplainButton`). The TopBar
tutor button is always visible (with an in-drawer "connect a key" prompt) rather than hidden — more
discoverable and avoids a hydration guard on the button. Every AI surface self-gates on `hasAi` behind
a `useMounted()` guard. 164 tests pass (incl. the mocked-fetch Gemini client suite).

## 17. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Exposed/leaked key | User-owned, masked, header-only, removable; explicit "don't share / don't use shared machines" notice |
| AI states a wrong number, undermining trust | Computed values passed as ground truth and declared authoritative; every output badged "AI-generated"; graded answers stay engine-only |
| Hint reveals the answer | Answer/solution excluded from the hint context + explicit "no final answer" instruction |
| Model id churn / unavailable model | Dropdown of known ids, default 2.5 Flash; unknown id → clean API error, not a crash |
| Cost/quota surprises | Free-tier default, capped tokens per feature, caching, 429 messaging |
| Safety filter blocks / unsafe asks | System prompt scopes to student chemistry and declines hazardous synthesis; blocked responses handled gracefully |
| Google auth-key migration (2026 deadlines) | We accept the new `AQ.` auth-key format; header auth works for both; link users to AI Studio to create/rotate keys |

## 18. Sources

- [Gemini API quickstart](https://ai.google.dev/gemini-api/docs/quickstart)
- [Text generation (`@google/genai`)](https://ai.google.dev/gemini-api/docs/text-generation)
- [generateContent REST reference](https://ai.google.dev/api/generate-content)
- [Models list](https://ai.google.dev/gemini-api/docs/models)
- [Using Gemini API keys (auth-key migration timeline)](https://ai.google.dev/gemini-api/docs/api-key)
- [`@google/genai` on npm](https://www.npmjs.com/package/@google/genai)

---

*Companion to the app's no-backend stance: AI is an optional, user-keyed layer that explains and coaches
on top of the deterministic engines — it never becomes the source of truth for any graded chemistry.*
