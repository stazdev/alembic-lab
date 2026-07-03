# Lab Improvement Plan — Python Pipelines & In-Browser ML (No Backend)

> Successor to `laboratory.md`'s Module 4 backend plan, which is **dropped**. This plan upgrades Alembic
> using Python **only as an offline, dev-time tool** and ML **only in the browser** — the deployed app
> stays a static/serverless Next.js app with zero servers to run.
>
> **v2 (2026-07-03):** now includes (a) a deep scientific-accuracy audit of every engine and data table,
> (b) an ONLINE-VERIFIED catalog of real, installable ML models and libraries (every version, license,
> and capability below was checked against live npm/GitHub/Hugging Face sources — not from memory), and
> (c) the first-time-user **walkthrough feature, which is now implemented** (see §10).

---

## Table of Contents

1. [The No-Backend Architecture for Python & ML](#1-the-no-backend-architecture-for-python--ml)
2. [Audit Summary — What's Real vs. What's Limited](#2-audit-summary--whats-real-vs-whats-limited)
3. [Scientific Accuracy Audit — Verified Fix List](#3-scientific-accuracy-audit--verified-fix-list)
4. [Where ML is the WRONG tool (keep deterministic)](#4-where-ml-is-the-wrong-tool-keep-deterministic)
5. [Verified Tool & Model Catalog (checked online, July 2026)](#5-verified-tool--model-catalog)
6. [Improvement 1 — Generalized Reaction Engine (Python-generated ruleset)](#6-improvement-1--generalized-reaction-engine)
7. [Improvement 2 — In-Browser Property Prediction (revised: mostly no training needed)](#7-improvement-2--in-browser-property-prediction)
8. [Improvement 3 — Spectra Simulation (revised: real in-browser NMR exists)](#8-improvement-3--spectra-simulation)
9. [Improvement 4 — 3D Conformers Without PubChem (revised: in-browser is possible)](#9-improvement-4--3d-conformers-without-pubchem)
10. [Improvement 5 — Walkthrough / Onboarding — ✅ SHIPPED](#10-improvement-5--walkthrough--onboarding--shipped)
11. [Improvement 6 — Expanded Reference Datasets](#11-improvement-6--expanded-reference-datasets)
12. [Improvement 7 — Kekulé Editor Round-Trip ("analyze my molecule")](#12-improvement-7--kekulé-editor-round-trip)
13. [Improvement 8 — Reaction Prediction & Retrosynthesis (build-time, optional)](#13-improvement-8--reaction-prediction--retrosynthesis)
14. [Improvement 9 — Adaptive Review (optional)](#14-improvement-9--adaptive-review)
15. [Non-ML Cleanups from the Audit](#15-non-ml-cleanups-from-the-audit)
16. [Repository Layout & Tooling](#16-repository-layout--tooling)
17. [Phased Roadmap](#17-phased-roadmap)
18. [Performance & Size Budgets](#18-performance--size-budgets)
19. [Risks & Mitigations](#19-risks--mitigations)

---

## 1. The No-Backend Architecture for Python & ML

"No backend" does **not** mean "no Python" and "no ML." It means nothing runs server-side at request
time. Three patterns cover everything in this plan:

### Pattern A — Python as a build-time data factory

```
pipelines/ (Python, runs on YOUR machine only, never deployed)
   ├─ RDKit, pandas, requests (PubChem/NIST), scikit-learn, torch
   ├─ generates →  data/generated/*.json   (versioned, committed to git)
   └─ generates →  public/structures/*.sdf (pre-computed 3D conformers)
```

Output is committed, diffable, and SME-reviewable — matching the existing "data over code" convention.

### Pattern B — ML trained in Python, executed in the browser (ONNX)

```
pipelines/train_*.py ──export──► public/models/*.onnx (small) ──► onnxruntime-web (WASM/WebGPU)
```

Features computed by the already-shipped RDKit.js (`get_descriptors`, Morgan fingerprints — verified
present in the MinimalLib source).

### Pattern C — pure-JS scientific libraries with built-in prediction *(new in v2)*

The verification round found that a large part of what v1 planned to train **already exists as
maintained, permissively-licensed JavaScript** — most importantly **openchemlib-js**, which ships
real logP/logS/toxicity/druglikeness predictors and a 3D conformer generator, pure JS, no server,
no model download. Where Pattern C covers a need, it beats Patterns A and B on effort and risk.

**Rule of thumb:**

| Need | Tool |
|---|---|
| Exact answers (stoichiometry, pH, grading) | Existing deterministic engines — untouched |
| More breadth of *known* facts (Ksp, ΔHf, pKa, E°) | Pattern A: Python-harvested datasets |
| Estimates a JS library already provides (logP, logS, tox, conformers, NMR shifts) | Pattern C |
| Estimates with no JS option (pKa is the main one) | Pattern B: small custom ONNX model |

---

## 2. Audit Summary — What's Real vs. What's Limited

### Already real (verified twice — do not touch)
- Full 118-element data; all 14 calculators are genuine engines with 16 passing Vitest suites (105 tests)
- Task answers computed from the engines at module load — grading cannot drift
- Dashboard/Profile stats derived from real localStorage state; RDKit.js 2D, 3Dmol 3D, Kekulé editor, PubChem proxy all genuine

### The gaps (this plan's targets)

| # | Gap | Where | Severity |
|---|---|---|---|
| G1 | Sandbox reacts only for **17 hand-coded reactant pairs** | `lib/chemistry/resolve.ts:73-211` | ★★★ |
| G2 | Per-reaction ΔH magic numbers, not Hess-derived | `resolve.ts` | ★★ |
| G3 | `CONC` map contradicts `reagent.concentrationM` by 10× | `resolve.ts:47-55` | ★★ |
| G4 | No property prediction — RDKit.js only draws | `StructureDiagram.tsx` | ★★ |
| G5 | Spectrophotometer is decorative; zero spectra features | `data/apparatus.ts:339` | ★★ |
| G6 | 3D structures depend on PubChem at runtime | `app/api/molecule/route.ts` | ★ |
| G7 | Tiny curated tables; Ksp/equilibria inline in a component | `EquilibriumTool.tsx:41-104` | ★★ |
| G8 | Kekulé editor output never parsed or analyzed | `StructureEditor.tsx` | ★ |
| G9 | Notifications = static 5-item changelog | `NotificationsDrawer.tsx:14-40` | ★ |
| G10 | Fabricated thermal model constants | `sandboxStore.ts:349-355` | ★ |
| ~~G11~~ | ~~No first-time-user onboarding~~ | — | ✅ **shipped** (§10) |

---

## 3. Scientific Accuracy Audit — Verified Fix List

A dedicated audit traced the math in every `lib/chemistry/*` module and spot-checked every data table
against CODATA/NIST/IUPAC values (concrete test values were computed to confirm each claim).

### Overall verdict
**The computation layer is industry-standard quality.** Constants (R = 8.314, F = 96485, R·ln10/F =
0.0592 V), the full charge-balance titration engine (bisection over the exact residual including the
Kw term), the rational-arithmetic RREF balancer, kinetics, Hess sums with correct kJ/J handling, and
the electron-configuration anomaly table are all **correct**. All spot-checked data values matched
references (ΔHf° H₂O(l) −285.8, S° O₂ 205.2, E° Cu²⁺/Cu +0.34, Ka acetic 1.8×10⁻⁵, IUPAC 2021 atomic
masses). No kJ/J unit-mixing bug exists anywhere.

### Confirmed issues to fix (priority order)

| # | Issue | Location | Fix |
|---|---|---|---|
| F1 | **Reagent labels say 0.1 M; engine simulates 1 M** — a student adding "0.1 M HCl" sees pH ≈ 0 instead of ≈ 1. Misleading. | `resolve.ts:48-55` vs `reagents.ts` | Delete `CONC`; make the engine consume `reagent.concentrationM` (same fix as G3) |
| F2 | **`weakAcidPH` ignores water autoionization** — at C = 10⁻⁹ M it returns pH 9.0 (an acid reported as basic). The strong-acid/base and titration paths already handle Kw correctly; only the weak point-functions have the hole. | `ph.ts:28` | Add the Kw term (solve the cubic, or guard C ≲ 10⁻⁶ M) |
| F3 | **Na + water ΔH is ~2× low** — rule stores −184 kJ but the reaction as written (coeff 2) is −368.6 kJ by Hess from the app's own `thermoData.ts`. | `resolve.ts:113` | Correct to −368 now; superseded by Hess-derived ΔH in Improvement 1 |
| F4 | **`bufferPH` divides by zero** → `Infinity`/`NaN` when either buffer component is 0. | `ph.ts:39` | Input guard |

### Acceptable approximations — document in the UI, don't "fix"
- Kw = 10⁻¹⁴ hardcoded (25 °C only) — state it.
- Carbonate treated with ammonia's Kb (`resolve.ts:244`) — under-estimates basicity; CaCO₃ (insoluble) counted toward pH. Fixed properly by Improvement 1's `weak_species.json`.
- Titration curves are monoprotic-only (H₂SO₄'s second proton, H₃PO₄ not stepwise) — flag "first proton only" until polyprotic support lands.
- Lineweaver–Burk linear fit distorts low-[S] points (known pedagogy caveat) — consider adding a nonlinear or Eadie–Hofstee option.
- Linear RGB color mixing (dyes mix subtractively) — superseded by spectrum-derived color in Improvement 3.

### Missing vs. industry standard (PhET / ChemCollective / Beyond Labz comparison)
1. **Balancer can't parse hydrates** (`CuSO₄·5H₂O`) — common school formula; add `·`/`.` handling to `parseFormula`.
2. **No polyprotic titration curves** (two equivalence points).
3. **Gas laws ideal-only** — no van der Waals, Dalton partial pressures, or STP molar-volume helper.
4. **No buffer capacity (β)** and no Henderson–Hasselbalch validity warning (0.1 < ratio < 10).
5. **Kinetics:** no Arrhenius fit from a (k,T) series (only the 2-point form).

**Effort:** F1–F4 ≈ 1–2 days; the "missing features" list ≈ 1 week total. These should land before
any ML work — accuracy is the product's core promise.

---

## 4. Where ML is the WRONG tool (keep deterministic)

- **Anything graded.** Closed-form and exact today; an ML estimate would be strictly worse.
- **Inorganic reaction outcomes.** Solubility rules + Ksp + ΔG feasibility (Improvement 1) is more
  correct and more teachable than a neural net. ML reaction prediction is only for the organic
  stretch goal (§13).
- **Notifications / dashboard.** Event-driven code, not models.

Hard UI rule: every estimate is badged *"estimated"* with an error bar; curated reference data always
wins when present.

---

## 5. Verified Tool & Model Catalog

Everything below was **verified against live sources on 2026-07-03** (npm registry, GitHub, Hugging
Face, project docs). Items that turned out to be dead, API-gated, or license-trapped are flagged —
that's the "real feedback."

### 5.1 The headline finding — openchemlib-js

**`openchemlib` 9.24.0** (npm, BSD-3-Clause, published 2026-07-01 — very active, cheminfo org).
Pure JS (no WASM), fully client-side. Verified from its shipped `index.d.ts` to include:

- `MoleculeProperties` — **logP, logS (aqueous solubility), TPSA, H-bond donors/acceptors, rotatable bonds, stereocenters**
- `DruglikenessPredictor`, `ToxicityPredictor` (mutagenic/tumorigenic/irritant/reproductive risk with responsible substructures), `DrugScoreCalculator`
- **`ConformerGenerator` — real 3D conformer generation** (torsion-based, honors E/Z & R/S) + **`ForceFieldMMFF94`** minimization
- 2D coordinate generation, SVG depiction, substructure search + fingerprint index, MCS, canonical SMILES, `Reactor`/`Transformer`
- **Not included: pKa** (verified absent — the one true gap)

This single dependency covers most of v1's planned "train solubility/logP models" work and the 3D
gap, with zero model downloads. **RDKit.js was confirmed (from `minilib.cpp` source) to have NO
ETKDG/3D embedding** — openchemlib-js is the only in-browser 3D route.

### 5.2 In-browser ML runtimes

| Tool | Verified version | License | Notes |
|---|---|---|---|
| `onnxruntime-web` | 1.27.0 (2026-06-19) | MIT | WebGPU EP stable; WASM fallback ~8 MB optimized build. The workhorse for custom models. |
| `@huggingface/transformers` (transformers.js) | 4.2.0 (2026-04-22) | Apache-2.0 | Runs ONNX models incl. RoBERTa/BERT. **Note:** `@xenova/transformers` is abandoned (frozen 2.17.2, 2024) — use the `@huggingface/` scope. |
| `@mlc-ai/web-llm` | 0.2.84 (2026-05-27) | Apache-2.0 | Full LLM in-browser via WebGPU; multi-GB downloads. Overkill unless you want an on-device tutor chatbot. |

WebGPU ships by default in Chrome/Edge 113+, Firefox 141+/145+, and Safari 26 as of 2026 — treat it
as progressive enhancement over the WASM fallback, not a baseline (mobile is still fragmented).

### 5.3 Chem transformer models (ONNX export reality check)

| Model | Verdict |
|---|---|
| **ChemBERTa** (DeepChem/seyonec, RoBERTa arch) | Exports cleanly via `optimum-cli export onnx` (RoBERTa is supported); no pre-made ONNX on HF, so **build it yourself**. Pick the 10M–44M variant, int8 → ~12–55 MB. Runs in-browser via transformers.js. |
| **MoLFormer** (IBM) | **Avoid for browser.** Needs `trust_remote_code` (custom linear-attention + custom tokenizer); does NOT export cleanly with Optimum. The one HF ONNX upload is undocumented and task-specific. |
| **ReactionT5v2** (sagawa, MIT, ~220M) | Best open forward+retro seq2seq pair; build-time use is trivial, in-browser is marginal (~110 MB int8). |
| **rxnfp** (IBM, MIT) | 27 MB BERT, weights bundled in-repo; produces reaction *fingerprints* (similarity/classification), not predictions. ONNX-able. |

### 5.4 Spectra prediction

- **NMR is the bright spot — real in-browser prediction exists.** `nmr-processing` (MIT, v22.18.0, maintained by cheminfo) + `openchemlib-utils` (MIT, v8.17.0, HOSE codes) + a **precomputed nmrshiftdb2 HOSE→shift table** (baked at build time) gives fully client-side ¹H/¹³C shift prediction. `nmr-predictor` (MIT, 2019) is the older fallback — avoid its "Spinus" mode, which calls an external service. `NMRium` (MIT) is a ready-made spectrum UI if wanted.
  - ⚠️ **Verify the exact nmrshiftdb2 data license** before redistributing a derived table.
- **IR & Mass-spec are precompute-only.** No JS-native predictor exists. `chemprop-IR` (MIT, Python) and `CFM-ID 4.0` (CC-BY, C++/Java) run at build time; ship static spectra for the fixed molecule set. `CASCADE` (MIT, DFT-accuracy NMR GNN) and `FullSSPrUCe` are research-grade, precompute-only (FullSSPrUCe license is unstated — verify).
- **No maintained HF/ONNX NMR/IR/MS model** is drop-in browser-ready — the HOSE/cheminfo path is the one to build.

### 5.5 Reaction prediction / retrosynthesis (all precompute-only — none run in-browser)

- **AiZynthFinder** (AstraZeneca, MIT, actively maintained into 2026, PyPI `aizynthfinder`) — the standout. One-command public USPTO model+template download; run retrosynthesis at build time, cache route trees as JSON.
- **Open Reaction Database (ORD)** (CC-BY-SA-4.0, active) — best source of real curated reactions (conditions, yields); `ORDerly` (MIT) cleans it into ML-ready sets.
- **ReactionT5v2** (MIT, HF) for forward prediction; **Molecular Transformer**/**Graph2SMILES** are downloadable but abandoned; **Chemformer** is archived → use `aizynthmodels`.
- ⚠️ **Flagged out:** `rxn4chemistry` is an IBM cloud **API client, not a model** (unusable no-backend); **LocalRetro** relicensed to **non-commercial** (CC BY-NC-SA) in Jan 2026 — avoid if commercial.

### 5.6 Adaptive learning

- **`ts-fsrs`** (MIT, v5.4.1, browser-native TypeScript) — mature FSRS spaced-repetition scheduler, better than SM-2. The pick for a review layer.
- **BKT** (Bayesian Knowledge Tracing) for per-skill mastery: **no maintained JS library exists**, but it's a 2-state HMM with 4 params — **~30 lines of TS**, no dependency needed. pyBKT is C++/Fortran, not portable.
- **DKT** (deep knowledge tracing): skip — no JS implementation, and it only beats BKT with large interaction datasets a no-backend app won't have.

### 5.7 Install shortlist (ranked, most practical first)

1. **`openchemlib`** — logP/logS/TPSA/tox/druglikeness + 3D conformers, pure JS, now. Biggest single win.
2. **`ts-fsrs`** — spaced-repetition review layer, MIT, browser-native.
3. **`nmr-processing` + `openchemlib-utils`** — in-browser NMR prediction (+ build-time nmrshiftdb2 table).
4. **`onnxruntime-web`** — only when you need the custom **pKa** model (the one gap no JS library fills).
5. **`@huggingface/transformers`** — if/when you ship ChemBERTa embeddings for similarity search.
6. **AiZynthFinder + ORD** *(build-time, Python)* — precomputed retrosynthesis/reaction data for the organic stretch goal.
7. Hand-rolled **BKT** (~30 lines) — per-skill mastery for adaptive task recommendation.

---

## 6. Improvement 1 — Generalized Reaction Engine

**Goal.** Replace the 17-pair lookup in `resolve.ts` with a general ionic-chemistry engine driven by
Python-generated datasets, so *any* combination of shelf reagents resolves correctly — making the
blueprint's core differentiator ("computed, not scripted") actually true. **No ML** — this is
Python-as-data-factory and the highest-value item in the plan.

`pipelines/gen_reaction_data.py` → `data/generated/`:
- `ions.json` (cations/anions each reagent dissociates into, colors, spectator flags)
- `solubility.json` (~300 cation×anion pairs from solubility rules + harvested Ksp — replaces 3 hardcoded precipitations + 5 inline Ksp salts)
- `thermo_expanded.json` (~400 species ΔHf°/S°/ΔGf° from NIST/CRC — kills every magic ΔH; engine computes ΔH°rxn by Hess at resolve time using existing `thermo.ts`, fixing F3/G2)
- `activity_series.json` (replaces hardcoded metal cases + copper special-case)
- `weak_species.json` (real Ka/Kb — fixes the ammonia-Kb-for-carbonate approximation)
- `indicators.json` (pH→RGB transition curves from published spectra — replaces 3 hardcoded thresholds)

Engine rewrite keeps the pure-function signature so `sandboxStore.ts` and tests are unaffected:
`speciate → matchReactions BY CLASS (acid–base / precipitation / gas / displacement / complex) →
feasibility (ΔG<0 gate) → extent + limiting reagent → emit`. Delete `CONC`, consume
`reagent.concentrationM` (fixes F1/G3). Pull specific heats from `thermo_expanded.json` and derive
heating rate from hotplate wattage (fixes G10). Snapshot-test the whole shelf×shelf matrix against a
Python-emitted `expected_outcomes.json` before deleting the old ruleset.

**Effort:** ~2–3 weeks.

---

## 7. Improvement 2 — In-Browser Property Prediction

**Revised from v1: mostly no training needed.** Add **`openchemlib`** and surface a
`components/chem/PropertyCard.tsx` (logP, logS/aqueous solubility, TPSA, H-bond donors/acceptors,
rotatable bonds, druglikeness, toxicity risks) computed **client-side, instantly, with no model
download**. Mount it in the Molecules explorer, the Kekulé round-trip panel (§12), and compound cards.

- Refactor the RDKit.js loader out of `StructureDiagram.tsx` into `lib/chem/rdkit.ts` so diagrams and any future descriptor use share one instance.
- **pKa is the one gap** openchemlib-js doesn't fill → the sole justified custom ONNX model: train in `pipelines/train_pka.py` on OPERA/IUPAC pKa sets, export int8 ONNX (~0.5 MB), run via `onnxruntime-web`. Freeze the descriptor list in `models/feature_spec.json`; a CI parity test asserts Python-RDKit and RDKit.js compute identical features on 100 reference SMILES.
- **Solubility bridge to the bench:** openchemlib-js logS gives a "will it dissolve?" hint when a solid reagent is added — badged as an estimate; the curated `solubility.json` value wins when present.

Every value is badged *"estimated"*. **Effort:** ~1 week (property card) + ~1 week (pKa model).

---

## 8. Improvement 3 — Spectra Simulation

Make the decorative spectrophotometer (G5) a working instrument and add NMR/IR panels.

- **UV-Vis (data-driven, no ML):** `gen_spectra.py` → `uvvis.json` with ε(λ) curves for the colored species the engine knows. A `Spectrophotometer` bench instrument computes A(λ) = Σ εᵢ(λ)·cᵢ·l by Beer–Lambert from live mixture state → real calibration-curve tasks. Bonus: derive the 3D liquid **color from the spectrum** (retires the linear-RGB approximation).
- **¹H/¹³C NMR (real, in-browser):** `nmr-processing` + `openchemlib-utils` HOSE codes + precomputed nmrshiftdb2 table → `predictNmr(smiles)` → spectrum with click-a-peak ↔ highlight-the-atom (RDKit.js already supports atom highlighting). Genuinely advanced; pairs with the organic mechanisms content.
- **IR (hybrid):** baseline group-frequency synthesis from the functional groups the app already catalogs; optional precomputed `chemprop-IR` refinement later.

**Effort:** UV-Vis ~1.5 wk; NMR ~1.5 wk; IR ~1 wk.

---

## 9. Improvement 4 — 3D Conformers Without PubChem

**Revised: fully in-browser is now possible.** openchemlib-js `ConformerGenerator` + `ForceFieldMMFF94`
generate and minimize 3D conformers client-side (RDKit.js MinimalLib has no ETKDG — verified). So:
- Bundle pre-generated SDFs for the expanded library (`gen_conformers.py`, RDKit ETKDGv3+MMFF, ~300 compounds) as the fast path.
- Runtime order in `Molecule3D.tsx`: bundled SDF → PubChem proxy (kept, cold-path) → **openchemlib-js on-device generation** for arbitrary drawn/searched molecules — no more 2D-in-3D fallback.

**Effort:** ~1 week.

---

## 10. Improvement 5 — Walkthrough / Onboarding — ✅ SHIPPED

Built this turn (typecheck clean, 105 tests green, routes serving 200):

- **`lib/stores/tourStore.ts`** — Zustand + `persist` under `alembic-tour`; `seen[]` persisted, active tour/step ephemeral (mirrors the `prefsStore` pattern).
- **`lib/tour/tours.ts`** — 7 tours (Dashboard, Inventory, Sandbox, Reactions, Tasks, Periodic Table, Molecules), 4–6 steps each, keyed to `data-tour` anchors added to each view.
- **`components/shell/TourOverlay.tsx`** — spotlight overlay (cut-out ring via a large box-shadow), auto-follows the target through scroll/resize/late layout with a spring, edge-aware card placement, `Step N of M` badge, Back/Next/Skip, keyboard (Esc/←/→), focus management, and full reduced-motion support (honors both `prefers-reduced-motion` and the app's `reduceMotion` pref). Mounted globally in `app/layout.tsx`.
- **Auto-start once per page** (700 ms after mount, gated on the hydration `mounted` guard); **replay** via a Help (`?`) button in the `TopBar` for the current page, and a **"Replay walkthrough"** row in Settings that clears `seen`. "Clear all local data" also resets tours.

Follow-ups (not blocking): a per-tour "don't show again" is implicit in `seen`; could add a one-time global welcome modal on first-ever load, and Playwright coverage of the tour flow.

---

## 11. Improvement 6 — Expanded Reference Datasets

One `gen_reference_tables.py`, one PR per table, each an SME-reviewable data diff with
`{source, retrievedAt, license}` provenance:

| Dataset | Today | Target |
|---|---|---|
| Ksp | 5 inline in `EquilibriumTool.tsx` | ~80, moved to `data/generated/ksp.json` |
| Le Chatelier systems | 4 inline | ~15, in `data/` |
| Weak acids/bases | 9 | ~60 incl. polyprotic Ka₁/Ka₂/Ka₃ |
| Thermo species | 40 | ~400 |
| Reduction potentials | 25 | ~100 |
| Molecule library | 14 | ~300 (name, SMILES, CID, tags, bundled SDF) |
| Indicators | 3 thresholds | ~10 transition curves |
| Functional-group tests | 6×6 | ~12 groups × 10 tests |

**Effort:** ~1–2 weeks, parallelizable.

---

## 12. Improvement 7 — Kekulé Editor Round-Trip

Close G8: Kekulé exports SMILES/molblock → RDKit.js sanitize/canonicalize → validate (kind valence
errors) → formula + molar mass (existing engine) → **property card (§7) + spectra (§8) + 3D (§9)**.
Turns the inert sketchpad into the app's "bring your own molecule" entry point and the showcase for
the whole prediction stack. Stretch: grade drawn products in mechanism tasks by canonical-SMILES
comparison (deterministic, not ML). **Effort:** ~1 week after §7–§9.

---

## 13. Improvement 8 — Reaction Prediction & Retrosynthesis

**Optional, build-time only, organic stretch goal.** None of these run in-browser; the pattern is
precompute → static JSON. AiZynthFinder (MIT, maintained) generates retrosynthesis route trees for a
curated target set; ORD (CC-BY-SA) supplies real reaction examples; ReactionT5v2 (MIT) or Molecular
Transformer does forward prediction offline. Render cached trees client-side. Covers the deferred
Module 2 "multi-step synthesis planning." **Do not** wire in `rxn4chemistry` (IBM API) or LocalRetro
(now non-commercial). **Effort:** research-gated, ~3–4 weeks if pursued.

---

## 14. Improvement 9 — Adaptive Review

**Optional.** `ts-fsrs` (MIT) adds a spaced-repetition review deck over completed tasks/concepts —
a genuinely useful study layer, no backend. A ~30-line hand-rolled BKT tracks per-skill mastery to
recommend the next task. Skip DKT. **Effort:** ~1 week for FSRS review; +2–3 days for BKT mastery.

---

## 15. Non-ML Cleanups from the Audit

1. **Accuracy fixes F1–F4** (§3) — do first; accuracy is the core promise.
2. **Hydrate parsing** in the balancer (`CuSO₄·5H₂O`), buffer-capacity/H–H validity warnings, van der Waals/Dalton in gas laws, Arrhenius series fit — the industry-standard gaps.
3. **Notifications (G9):** replace the static `UPDATES` array with event-derived, read-tracked notifications persisted like other prefs.
4. **Move inline `SALTS`/`EQUILIBRIA`** out of `EquilibriumTool.tsx` into `data/` (superseded by §11 but worth doing now).
5. **Delete dead `ComingSoon.tsx`**; add the missing `reagents.ts` data-integrity test.

---

## 16. Repository Layout & Tooling

```
lab/
├─ pipelines/                  # NEW — Python, dev-time only, never deployed
│  ├─ pyproject.toml           # uv/poetry; rdkit, pandas, torch, skl2onnx/onnx, pytest
│  ├─ gen_reaction_data.py     # → data/generated/{ions,solubility,thermo_expanded,…}.json
│  ├─ gen_reference_tables.py  # → data/generated/{ksp,weak_species,potentials,…}.json
│  ├─ gen_conformers.py        # → public/structures/*.sdf
│  ├─ gen_spectra.py           # → data/generated/{uvvis,indicators}.json + nmrshiftdb2 HOSE table
│  ├─ train_pka.py             # → public/models/pka.onnx (the ONE custom model)
│  └─ tests/                   # pytest: data validation + JS/Python feature-parity fixtures
├─ data/generated/             # NEW — committed JSON, provenance headers, never hand-edited
├─ public/models/              # NEW — pka.onnx + feature_spec.json
├─ lib/ml/                     # NEW — onnx.ts, featurize.ts (only for pKa)
├─ lib/chem/rdkit.ts           # NEW — shared RDKit.js singleton (extracted from StructureDiagram)
├─ lib/stores/tourStore.ts     # ✅ shipped
├─ lib/tour/tours.ts           # ✅ shipped
├─ components/shell/TourOverlay.tsx  # ✅ shipped
└─ (everything else unchanged)
```

New client deps: `openchemlib`, `nmr-processing`, `openchemlib-utils`, `ts-fsrs` (all pure-JS,
permissive); `onnxruntime-web` only when the pKa model lands. Python outputs are committed, so
contributors without Python still build the app.

---

## 17. Phased Roadmap

| Phase | Contents | Outcome | Est. |
|---|---|---|---|
| **A — Accuracy & data** | §3 fixes F1–F4 + industry-standard gaps + §11 datasets + §15 cleanups + `pipelines/` scaffold | Everything correct and honest; dummy tables gone; pipeline pattern proven | 2–3 wk |
| **B — Real reaction engine** | §6 (ion/solubility/thermo `resolve.ts`) + UV-Vis spectrophotometer + conformer pre-gen | "Computed, not scripted" delivered; first working instrument | 3–4 wk |
| **C — In-browser predictions** | §7 (openchemlib-js property card + pKa ONNX) + §9 (on-device 3D) + §12 (Kekulé round-trip) + §8 NMR | "Draw or find any molecule → properties + spectra + 3D, on-device" | 3–4 wk |
| **D — Advanced (optional)** | §13 retrosynthesis (precompute) + §14 FSRS/BKT adaptive review | Organic/synthesis coverage; adaptive study layer | research-gated |

✅ **Onboarding (§10) already shipped** — independent of the phases above.

---

## 18. Performance & Size Budgets

| Asset | Size | Load policy |
|---|---|---|
| `openchemlib` | ~1–2 MB gz | Lazy, molecules/sketchpad routes only |
| `nmr-processing` + `openchemlib-utils` | ~1 MB gz | Lazy, NMR panel only |
| nmrshiftdb2 HOSE table | ~1–3 MB JSON | Lazy with the NMR panel |
| `onnxruntime-web` + pKa model | ~1.5 MB + 0.5 MB | Lazy, first pKa prediction only |
| `ts-fsrs` | ~30 KB | Review route only |
| Generated datasets (solubility/thermo) | ~1–2 MB | Route-split; load with the sandbox |
| Bundled SDFs (~300) | ~1.5 MB total | Per-molecule fetch, HTTP-cached |

No impact on landing/dashboard; sandbox +≤300 KB gz; first prediction ≤2 s cold / ≤50 ms warm on a
mid-range laptop. Keep inference off the main thread so the 3D bench never drops frames.

---

## 19. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| ML estimates read as truth (the blueprint's #1 risk) | Hard UI rule: badged estimates with error bars; curated reference data always wins |
| openchemlib-js predictions differ from RDKit values | Show the source library; treat as educational estimates, not lab-grade — documented in the card |
| RDKit.js ↔ Python descriptor drift (pKa model) | Pinned versions + 100-SMILES parity fixture in CI |
| Generalized engine regresses the 17 known reactions | `expected_outcomes.json` matrix test must pass before deleting the old ruleset |
| Data/model licensing | Prefer NIST/PubChem/open sets; record `license` per file; ⚠️ verify nmrshiftdb2 data license and avoid LocalRetro (non-commercial) / rxn4chemistry (API-gated) |
| Python burdens contributors | Outputs committed; `uv` one-command setup; Python needed only to regenerate |

---

*Supersedes `laboratory.md` Module 4 (backend). Pedagogy, design system, and safety tiers remain in
force. Every version/license/capability in §5 was verified against live sources on 2026-07-03.*